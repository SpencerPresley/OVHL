import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { PostView } from './post-view';
import { ForumPostStatus, ReactionType } from '@prisma/client';
import type { ForumPost, ForumComment, GifData } from '@/types/forum';

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
    gif: comment.gif ? {
      id: comment.gif.id,
      url: comment.gif.url,
      title: comment.gif.title,
      width: comment.gif.width,
      height: comment.gif.height,
    } : null,
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
  const prisma = new PrismaClient();

  try {
    const { id, postId } = await params;
    const league = leagues[id as keyof typeof leagues];
    if (!league) {
      notFound();
    }

    const post = await prisma.forumPost.findUnique({
      where: {
        id: postId,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        comments: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            quotedComment: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                  },
                },
              },
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
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
      content: post.content || '',
      gif: post.gif as GifData | null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      status: post.status,
      authorId: post.authorId,
      leagueId: post.leagueId,
      author: {
        id: post.author.id,
        name: post.author.name || post.author.username,
        username: post.author.username,
      },
      reactions: post.reactions.map(reaction => ({
        id: reaction.id,
        type: reaction.type,
        createdAt: reaction.createdAt,
        userId: reaction.user.id,
        postId: reaction.postId || undefined,
        commentId: reaction.commentId || undefined,
        user: {
          id: reaction.user.id,
          name: reaction.user.name || reaction.user.username,
          username: reaction.user.username,
        },
      })),
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content || '',
        gif: comment.gif as GifData | null,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        status: comment.status,
        authorId: comment.authorId,
        postId: comment.postId,
        quotedCommentId: comment.quotedCommentId,
        author: {
          id: comment.author.id,
          name: comment.author.name || comment.author.username,
          username: comment.author.username,
        },
        quotedComment: comment.quotedComment ? {
          id: comment.quotedComment.id,
          content: comment.quotedComment.content || '',
          gif: comment.quotedComment.gif as GifData | null,
          createdAt: comment.quotedComment.createdAt,
          updatedAt: comment.quotedComment.updatedAt,
          status: comment.quotedComment.status,
          authorId: comment.quotedComment.authorId,
          postId: comment.quotedComment.postId,
          quotedCommentId: comment.quotedComment.quotedCommentId,
          author: {
            id: comment.quotedComment.author.id,
            name: comment.quotedComment.author.name || comment.quotedComment.author.username,
            username: comment.quotedComment.author.username,
          },
          quotedComment: null,
          reactions: [],
        } : null,
        reactions: comment.reactions.map(reaction => ({
          id: reaction.id,
          type: reaction.type,
          createdAt: reaction.createdAt,
          userId: reaction.user.id,
          postId: reaction.postId || undefined,
          commentId: reaction.commentId || undefined,
          user: {
            id: reaction.user.id,
            name: reaction.user.name || reaction.user.username,
            username: reaction.user.username,
          },
        })),
      })),
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
