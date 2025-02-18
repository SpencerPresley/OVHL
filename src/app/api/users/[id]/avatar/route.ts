import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Update avatar URL
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Only allow users to update their own avatar
    if (decoded.id !== id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { avatarUrl } = await request.json();

    try {
      const user = await prisma.user.update({
        where: { id },
        data: { 
          avatarUrl 
        },
      });

      return NextResponse.json({ user });
    } catch (prismaError) {
      if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error:', prismaError.message);
        return NextResponse.json({ message: `Database error: ${prismaError.message}` }, { status: 500 });
      }
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Failed to update avatar:', error);
    return NextResponse.json({ 
      message: error.message || 'Failed to update avatar',
      details: error.toString()
    }, { status: 500 });
  }
}

// Remove avatar
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Only allow users to remove their own avatar
    if (decoded.id !== id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: { 
          avatarUrl: null 
        },
      });

      return NextResponse.json({ user });
    } catch (prismaError) {
      if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error:', prismaError.message);
        return NextResponse.json({ message: `Database error: ${prismaError.message}` }, { status: 500 });
      }
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Failed to remove avatar:', error);
    return NextResponse.json({ 
      message: error.message || 'Failed to remove avatar',
      details: error.toString()
    }, { status: 500 });
  }
} 
