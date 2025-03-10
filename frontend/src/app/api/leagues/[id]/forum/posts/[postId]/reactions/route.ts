import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { ForumService } from '@/lib/services/forum-service';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';
import { ReactionType } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    // Fix 1: Await params to properly handle dynamic route data
    const paramsData = { ...(await params) };
    const { postId } = paramsData;

    const { type, commentId, userId } = await request.json();

    // Check for NextAuth session first
    const session = await getServerSession(AuthOptions);
    let authenticatedUser;

    if (session?.user?.id) {
      authenticatedUser = {
        id: session.user.id,
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
        };

        authenticatedUser = {
          id: decoded.id,
        };
      } catch (tokenError) {
        console.error('Token verification failed:', tokenError);
        return NextResponse.json({ error: 'Authentication invalid' }, { status: 401 });
      }
    }

    // No valid authentication found
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify that the authenticated user matches the requested userId
    if (authenticatedUser.id !== userId) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Fix 2: Implement toggle reaction logic using the actual methods available in ForumService
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
