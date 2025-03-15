import { NextResponse } from 'next/server';
import { ForumService } from '@/lib/services/forum-service';
import { requireAuth } from '@/lib/auth';
import { ReactionType } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const resolvedParams = await params;
    const { postId } = resolvedParams;
    const { type, commentId, userId } = await request.json();

    // Authenticate with NextAuth
    const user = await requireAuth();

    // Verify that the authenticated user matches the requested userId
    if (user.id !== userId) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Implement toggle reaction logic
    // First, check if the reaction already exists
    const existingReaction = await ForumService.findReaction({
      userId,
      type: type as ReactionType,
      postId: commentId ? undefined : postId,
      commentId: commentId || undefined,
    });

    let result;

    if (existingReaction) {
      // If reaction exists, delete it (toggle off)
      await ForumService.deleteReaction(existingReaction.id);
      result = { removed: true, reactionId: existingReaction.id };
    } else {
      // If reaction doesn't exist, create it (toggle on)
      const newReaction = await ForumService.createReaction({
        userId,
        type: type as ReactionType,
        postId: commentId ? undefined : postId,
        commentId: commentId || undefined,
      });
      result = { added: true, reaction: newReaction };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 });
  }
}
