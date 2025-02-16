import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

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

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = verify(token.value, secret) as { id: string };
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
    const post = await prisma.forumPost.findUnique({
      where: {
        id: params.postId,
        status: 'PUBLISHED',
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found or not published' }, { status: 404 });
    }

    // If commentId is provided, check if the comment exists and belongs to the post
    if (commentId) {
      const comment = await prisma.forumComment.findUnique({
        where: {
          id: commentId,
          postId: params.postId,
          status: 'PUBLISHED',
        },
      });

      if (!comment) {
        return NextResponse.json({ error: 'Comment not found or not published' }, { status: 404 });
      }
    }

    // Check if user has already reacted with this type
    const existingReaction = await prisma.forumReaction.findFirst({
      where: {
        userId: decoded.id,
        type,
        ...(commentId ? { commentId } : { postId: params.postId }),
      },
    });

    if (existingReaction) {
      // Remove the reaction if it already exists (toggle behavior)
      await prisma.forumReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      return NextResponse.json({ message: 'Reaction removed' });
    }

    // Create the reaction
    const reaction = await prisma.forumReaction.create({
      data: {
        type,
        userId: decoded.id,
        ...(commentId ? { commentId } : { postId: params.postId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ reaction }, { status: 201 });
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json({ error: 'Failed to handle reaction' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
