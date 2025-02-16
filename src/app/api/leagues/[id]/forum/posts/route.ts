import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const posts = await prisma.forumPost.findMany({
      where: {
        leagueId: params.id,
        status: 'PUBLISHED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return NextResponse.json({ error: 'Failed to fetch forum posts' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { title, content, authorId } = await request.json();

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        authorId,
        leagueId: params.id, // This is just a string identifier, not a foreign key
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating forum post:', error);
    return NextResponse.json({ error: 'Failed to create forum post' }, { status: 500 });
  }
}
