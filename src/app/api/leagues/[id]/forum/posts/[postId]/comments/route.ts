import { NextResponse } from 'next/server';
import { ForumPostStatus } from '@prisma/client';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { UserService } from '@/lib/services/user-service';
import { ForumService } from '@/lib/services/forum-service';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';

type Subscriber = {
  userId: string;
  user: {
    id: string;
    name: string | null;
  };
};

export async function POST(
  request: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const { id, postId } = await params;
    
    // Check for NextAuth session first
    const session = await getServerSession(AuthOptions);
    let user;
    
    if (session?.user?.id) {
      user = {
        id: session.user.id,
        name: session.user.name,
      };
    } else {
      // Fall back to JWT token
      const cookieStore = await cookies();
      const token = cookieStore.get('token');

      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      try {
        const decoded = verify(token.value, process.env.JWT_SECRET!) as {
          id: string;
          name: string;
        };

        user = {
          id: decoded.id,
          name: decoded.name,
        };
      } catch (tokenError) {
        console.error('Token verification failed:', tokenError);
        return NextResponse.json({ error: 'Authentication invalid' }, { status: 401 });
      }
    }

    // No valid authentication found
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const post = await ForumService.getPostBasicInfo(postId);

    if (!post) {
      return NextResponse.json({ error: 'Post not found or not published' }, { status: 404 });
    }

    const { content, quotedCommentId, gif } = await request.json();

    const comment = await ForumService.createComment({
      content,
      authorId: user.id,
      postId,
      quotedCommentId: quotedCommentId || undefined,
      gif,
    });

    // Add the commenter as a subscriber
    await ForumService.upsertSubscription(user.id, postId);

    // Get subscribers and create notifications
    const subscribers = await ForumService.getSubscribers(postId);

    // Create notifications for subscribers (excluding the commenter)
    const notificationPromises = subscribers
      .filter((sub: Subscriber) => sub.userId !== user.id)
      .map((sub: Subscriber) =>
        UserService.createForumCommentNotification({
          userId: sub.userId,
          commenterName: user.name,
          postTitle: post.title,
          postId: post.id,
          commentId: comment.id,
          leagueId: id,
        })
      );

    // Also notify the post author if they're not already a subscriber
    if (
      !subscribers.some((sub: Subscriber) => sub.userId === post.authorId) &&
      post.authorId !== user.id
    ) {
      notificationPromises.push(
        UserService.createForumCommentNotification({
          userId: post.authorId,
          commenterName: user.name,
          postTitle: post.title,
          postId: post.id,
          commentId: comment.id,
          leagueId: id,
          isAuthorNotification: true,
        })
      );
    }

    // Wait for all notifications to be created
    await Promise.all(notificationPromises);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const comments = await ForumService.getComments(params.postId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}