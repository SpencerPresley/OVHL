import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { ForumService } from '@/lib/services/forum-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as { id: string };
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { type, commentId } = body;

    // Validate input
    if (!type) {
      return NextResponse.json({ error: 'Reaction type is required' }, { status: 400 });
    }

    // Check if post exists and is published
    const postExists = await ForumService.verifyPostExists(params.postId);
    if (!postExists) {
      return NextResponse.json({ error: 'Post not found or not published' }, { status: 404 });
    }

    // If commentId is provided, check if the comment exists and belongs to the post
    if (commentId) {
      const commentExists = await ForumService.verifyCommentExists(commentId, params.postId);
      if (!commentExists) {
        return NextResponse.json({ error: 'Comment not found or not published' }, { status: 404 });
      }
    }

    // Check if user has already reacted with this type
    const existingReaction = await ForumService.findReaction({
      userId: decoded.id,
      type,
      ...(commentId ? { commentId } : { postId: params.postId }),
    });

    if (existingReaction) {
      // Remove the reaction if it already exists (toggle behavior)
      await ForumService.deleteReaction(existingReaction.id);
      return NextResponse.json({ message: 'Reaction removed' });
    }

    // Create the reaction
    const reaction = await ForumService.createReaction({
      type,
      userId: decoded.id,
      ...(commentId ? { commentId } : { postId: params.postId }),
    });

    return NextResponse.json({ reaction }, { status: 201 });
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json({ error: 'Failed to handle reaction' }, { status: 500 });
  }
}
