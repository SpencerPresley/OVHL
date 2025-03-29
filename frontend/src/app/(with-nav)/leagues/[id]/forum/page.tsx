import { notFound } from 'next/navigation';
import { ForumDisplay } from './forum-display';
import { prisma } from '@/lib/prisma';
import { ForumPost, ForumPostStatus } from '@/types/forum';
import { User } from '@prisma/client'; // Import User type if needed elsewhere, or remove if not

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

export default async function ForumPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const league = leagues[id.toLowerCase()];

  if (!league) {
    notFound();
  }

  try {
    // Get total count for pagination using Prisma ORM
    const total = await prisma.forumPost.count({
      where: {
        leagueId: league.id,
        status: 'PUBLISHED',
      },
    });

    // Get paginated posts for this league using Prisma ORM
    const offset = (page - 1) * POSTS_PER_PAGE;
    const prismaPosts = await prisma.forumPost.findMany({
      where: {
        leagueId: league.id,
        status: 'PUBLISHED',
      },
      include: {
        author: { // Include author details
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        _count: { // Include counts of relations
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: POSTS_PER_PAGE,
      skip: offset,
    });

    // console.log(prismaPosts); // Optional: Keep for debugging if needed

    // Transform Prisma data to match our frontend ForumPost type
    // The structure from findMany is already quite close
    const posts: ForumPost[] = prismaPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      gif: post.gif as ForumPost['gif'], // Cast gif if necessary based on your type
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      status: post.status as ForumPostStatus, // Assert type if needed
      authorId: post.authorId,
      leagueId: post.leagueId,
      author: { // Author data is directly available via include
        id: post.author.id,
        name: post.author.name || post.author.username, // Use name or fallback to username
        username: post.author.username,
      },
      comments: [], // Still empty for list view
      reactions: [], // Still empty for list view
      _count: { // Counts are available via _count include
        comments: post._count.comments,
        reactions: post._count.reactions,
      },
    }));

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
