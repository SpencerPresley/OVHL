import { notFound } from 'next/navigation';
import { PrismaClient, ForumPostStatus } from '@prisma/client';
import { PostView } from './post-view';
import type { ForumPost, ForumComment, ReactionType } from '@/types/forum';

const leagues = {
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

function transformComment(comment: any, includeQuoted = true): ForumComment {
  const base = {
    id: comment.id,
    content: comment.content,
    gif: null,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    status: comment.status as unknown as import('@/types/forum').ForumPostStatus,
    authorId: comment.authorId,
    postId: comment.postId,
    quotedCommentId: comment.quotedCommentId,
    author: {
      id: comment.author.id,
      name: comment.author.name || comment.author.username,
      username: comment.author.username,
    },
    reactions: comment.reactions?.map((reaction: any) => ({
      id: reaction.id,
      type: reaction.type as unknown as ReactionType,
      createdAt: reaction.createdAt,
      userId: reaction.user.id,
      postId: reaction.postId,
      commentId: reaction.commentId,
      user: {
        id: reaction.user.id,
        name: reaction.user.name || reaction.user.username,
        username: reaction.user.username,
      },
    })) || [],
  };

  return {
    ...base,
    quotedComment: includeQuoted && comment.quotedComment 
      ? transformComment(comment.quotedComment, false) 
      : null,
  };
}

export default async function PostPage({ params }: { params: { id: string; postId: string } }) {
  const league = leagues[params.id as keyof typeof leagues];
  if (!league) {
    notFound();
  }

  const prisma = new PrismaClient();

  try {
    const post = await prisma.forumPost.findFirst({
      where: {
        id: params.postId,
        status: ForumPostStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        authorId: true,
        leagueId: true,
        createdAt: true,
        updatedAt: true,
        author: { 
          select: { 
            id: true, 
            name: true, 
            username: true 
          } 
        },
        comments: {
          where: { 
            status: ForumPostStatus.PUBLISHED 
          },
          orderBy: { 
            createdAt: 'asc' 
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            status: true,
            authorId: true,
            postId: true,
            quotedCommentId: true,
            author: { 
              select: { 
                id: true, 
                name: true, 
                username: true 
              } 
            },
            quotedComment: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                authorId: true,
                postId: true,
                author: { 
                  select: { 
                    id: true, 
                    name: true, 
                    username: true 
                  } 
                },
              },
            },
            reactions: {
              select: {
                id: true,
                type: true,
                createdAt: true,
                userId: true,
                postId: true,
                commentId: true,
                user: { 
                  select: { 
                    id: true, 
                    name: true, 
                    username: true 
                  } 
                },
              },
            },
          },
        },
        reactions: {
          select: {
            id: true,
            type: true,
            createdAt: true,
            userId: true,
            postId: true,
            commentId: true,
            user: { 
              select: { 
                id: true, 
                name: true, 
                username: true 
              } 
            },
          },
        },
      },
    });

    if (!post) {
      notFound();
    }

    // Transform the data to match our frontend types
    const transformedPost: ForumPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      gif: null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      status: post.status as unknown as import('@/types/forum').ForumPostStatus,
      authorId: post.authorId,
      leagueId: post.leagueId,
      author: {
        id: post.author.id,
        name: post.author.name || post.author.username,
        username: post.author.username,
      },
      reactions: post.reactions.map(reaction => ({
        id: reaction.id,
        type: reaction.type as unknown as ReactionType,
        createdAt: reaction.createdAt,
        userId: reaction.user.id,
        postId: reaction.postId,
        commentId: reaction.commentId,
        user: {
          id: reaction.user.id,
          name: reaction.user.name || reaction.user.username,
          username: reaction.user.username,
        },
      })),
      comments: post.comments.map(comment => transformComment(comment)),
    };

    return (
      <PostView league={league} post={transformedPost} />
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  } finally {
    await prisma.$disconnect();
  }
} 
