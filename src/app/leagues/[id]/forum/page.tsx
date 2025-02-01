import { notFound } from 'next/navigation';
import { ForumDisplay } from './forum-display';
import { PrismaClient } from '@prisma/client';
import { ForumPost, ForumPostStatus } from '@/types/forum';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

const POSTS_PER_PAGE = 10;

const leagues: Record<string, League> = {
  nhl: {
    id: 'nhl',
    name: 'NHL',
    logo: '/nhl_logo.png',
    bannerColor: 'bg-blue-900',
  },
  ahl: {
    id: 'ahl',
    name: 'AHL',
    logo: '/ahl_logo.png',
    bannerColor: 'bg-yellow-400',
  },
  echl: {
    id: 'echl',
    name: 'ECHL',
    logo: '/echl_logo.png',
    bannerColor: 'bg-emerald-600',
  },
  chl: {
    id: 'chl',
    name: 'CHL',
    logo: '/chl_logo.png',
    bannerColor: 'bg-teal-600',
  },
};

export default async function ForumPage({ params, searchParams }: { 
  params: { id: string }, 
  searchParams: { page?: string } 
}) {
  const { id } = params;
  const page = Number(searchParams.page) || 1;
  const league = leagues[id.toLowerCase()];

  if (!league) {
    notFound();
  }

  try {
    const db = new PrismaClient();
    
    // Get total count for pagination
    const [{ total }] = await db.$queryRaw<[{ total: number }]>`
      SELECT COUNT(DISTINCT fp.id) as total
      FROM forum_posts fp
      WHERE fp.league_id = ${league.id}
      AND fp.status = 'PUBLISHED'
    `;

    // Get paginated posts for this league
    const offset = (page - 1) * POSTS_PER_PAGE;
    const prismaData = await db.$queryRaw`
      SELECT 
        fp.*,
        u.name as author_name,
        u.username as author_username,
        u.id as author_id,
        COUNT(DISTINCT fc.id) as comment_count,
        COUNT(DISTINCT fr.id) as reaction_count
      FROM forum_posts fp
      LEFT JOIN "User" u ON fp.author_id = u.id
      LEFT JOIN forum_comments fc ON fc.post_id = fp.id
      LEFT JOIN forum_reactions fr ON fr.post_id = fp.id
      WHERE fp.league_id = ${league.id}
      AND fp.status = 'PUBLISHED'
      GROUP BY fp.id, u.id
      ORDER BY fp.created_at DESC
      LIMIT ${POSTS_PER_PAGE}
      OFFSET ${offset}
    `;

    // Transform Prisma data to match our frontend types
    const posts = (prismaData as any[]).map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      gif: null,
      createdAt: new Date(post.created_at),
      updatedAt: new Date(post.updated_at),
      status: post.status as ForumPostStatus,
      authorId: post.author_id,
      leagueId: post.league_id,
      author: {
        id: post.author_id,
        name: post.author_name || post.author_username,
        username: post.author_username,
      },
      comments: [], // We don't need comments for the list view
      reactions: [], // We don't need reactions for the list view
      _count: {
        comments: Number(post.comment_count),
        reactions: Number(post.reaction_count),
      },
    })) satisfies ForumPost[];

    return (
      <ForumDisplay 
        league={league} 
        initialPosts={posts}
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(Number(total) / POSTS_PER_PAGE),
        }}
      />
    );
  } catch (error) {
    console.error('Error loading forum posts:', error);
    return (
      <ForumDisplay 
        league={league} 
        initialPosts={[]}
        pagination={{
          currentPage: 1,
          totalPages: 1,
        }}
      />
    );
  }
} 
