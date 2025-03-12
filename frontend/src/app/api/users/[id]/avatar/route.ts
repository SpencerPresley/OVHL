import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Update avatar URL
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Authenticate with NextAuth
    const user = await requireAuth();

    // Only allow users to update their own avatar
    if (user.id !== id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { avatarUrl } = await request.json();

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          avatarUrl,
        },
      });

      return NextResponse.json({ user: updatedUser });
    } catch (prismaError) {
      if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error:', prismaError.message);
        return NextResponse.json(
          { message: `Database error: ${prismaError.message}` },
          { status: 500 }
        );
      }
      throw prismaError;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update avatar';
    console.error('Failed to update avatar:', errorMessage);
    return NextResponse.json(
      {
        message: errorMessage,
        details: error instanceof Error ? error.toString() : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Remove avatar
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Authenticate with NextAuth
    const user = await requireAuth();

    // Only allow users to remove their own avatar
    if (user.id !== id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          avatarUrl: null,
        },
      });

      return NextResponse.json({ user: updatedUser });
    } catch (prismaError) {
      if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error:', prismaError.message);
        return NextResponse.json(
          { message: `Database error: ${prismaError.message}` },
          { status: 500 }
        );
      }
      throw prismaError;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove avatar';
    console.error('Failed to remove avatar:', errorMessage);
    return NextResponse.json(
      {
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
