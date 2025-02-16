import { NextResponse } from 'next/server';
import {
  PrismaClient,
  NotificationType,
  NotificationStatus,
  Prisma,
  ForumPostStatus,
} from '@prisma/client';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

type Subscriber = {
  userId: string;
  user: {
    id: string;
    name: string | null;
  };
};

// Helper function to verify auth
async function verifyAuth(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = verify(token, secret) as { id: string };
    if (!decoded?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        isAdmin: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error verifying auth:', error);
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const { id, postId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyAuth(token);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { content = '', quotedCommentId, gif } = await request.json();

    if (!content && !gif) {
      return NextResponse.json({ error: 'Content or GIF is required' }, { status: 400 });
    }

    // Check if post exists and is published
    const post = await prisma.forumPost.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create the comment with proper type for gif
    const commentData: Prisma.ForumCommentCreateInput = {
      content: content || '', // Ensure content is never undefined
      author: { connect: { id: user.id } },
      post: { connect: { id: postId } },
      ...(quotedCommentId && { quotedComment: { connect: { id: quotedCommentId } } }),
      ...(gif && { gif }), // Store the GIF data directly as JSON
    };

    const comment = await prisma.forumComment.create({
      data: commentData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        quotedComment: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // Add the commenter as a subscriber if they're not already
    await prisma.forumPostSubscription.upsert({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
      create: {
        userId: user.id,
        postId: postId,
      },
      update: {},
    });

    // Create notifications for subscribers
    const subscribers = await prisma.forumPostSubscription.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: true,
      },
    });

    const notificationPromises = subscribers
      .filter((sub: Subscriber) => sub.userId !== user.id) // Don't notify the commenter
      .map((sub: Subscriber) => {
        const notificationData: Prisma.NotificationCreateInput = {
          user: { connect: { id: sub.userId } },
          type: NotificationType.FORUM,
          title: 'New Comment',
          message: `${user.name} commented on "${post.title}"`,
          status: NotificationStatus.UNREAD,
          link: `/leagues/${id}/forum/posts/${postId}#comment-${comment.id}`,
          metadata: {
            postId: postId,
            commentId: comment.id,
            leagueId: id,
          },
        };
        return prisma.notification.create({ data: notificationData });
      });

    // Also notify the post author if they're not already a subscriber
    if (
      !subscribers.some((sub: Subscriber) => sub.userId === post.authorId) &&
      post.authorId !== user.id
    ) {
      const authorNotificationData: Prisma.NotificationCreateInput = {
        user: { connect: { id: post.authorId } },
        type: NotificationType.FORUM,
        title: 'New Comment on Your Post',
        message: `${user.name} commented on your post "${post.title}"`,
        status: NotificationStatus.UNREAD,
        link: `/leagues/${id}/forum/posts/${postId}#comment-${comment.id}`,
        metadata: {
          postId: postId,
          commentId: comment.id,
          leagueId: id,
        },
      };
      notificationPromises.push(prisma.notification.create({ data: authorNotificationData }));
    }

    // Wait for all notifications to be created
    await Promise.all(notificationPromises);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const comments = await prisma.forumComment.findMany({
      where: {
        postId: params.postId,
        status: ForumPostStatus.PUBLISHED,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        quotedComment: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
