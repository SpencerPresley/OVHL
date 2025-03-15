import { NextResponse } from 'next/server';
import { ForumPostStatus } from '@prisma/client';
import { UserService } from '@/lib/services/user-service';
import { ForumService } from '@/lib/services/forum-service';
import { requireAuth } from '@/lib/auth';

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
    const resolvedParams = await params;
    const { id, postId } = resolvedParams;

    // Authenticate with NextAuth
    const authUser = await requireAuth();
    const user = {
      id: authUser.id,
      name: authUser.name || 'User',
    };

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
    const resolvedParams = await params;
    const { id, postId } = resolvedParams;
    const comments = await ForumService.getComments(postId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
