import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { PostView } from './post-view';
import { ForumPostStatus, ReactionType } from '@prisma/client';
import type { ForumPost, ForumComment, GifData } from '@/types/forum';

interface PrismaGif {
  id: string;
  title: string;
  images: {
    original: {
      url: string;
      width: number;
      height: number;
    };
  };
}

interface PrismaComment {
  id: string;
  content: string | null;
  gif: PrismaGif | null;
  createdAt: Date;
  updatedAt: Date;
  status: ForumPostStatus;
  authorId: string;
  postId: string;
  quotedCommentId: string | null;
  author: {
    id: string;
    name: string | null;
    username: string;
  };
  quotedComment: PrismaComment | null;
  reactions: Array<{
    id: string;
    type: ReactionType;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      username: string;
    };
    postId: string | null;
    commentId: string | null;
  }>;
}

interface PrismaPost {
  id: string;
  title: string;
  content: string | null;
  gif: PrismaGif | null;
  createdAt: Date;
  updatedAt: Date;
  status: ForumPostStatus;
  authorId: string;
  leagueId: string;
  author: {
    id: string;
    name: string | null;
    username: string;
  };
  comments: PrismaComment[];
  reactions: Array<{
    id: string;
    type: ReactionType;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      username: string;
    };
    postId: string | null;
    commentId: string | null;
  }>;
}

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

function transformComment(comment: PrismaComment, includeQuoted = true): ForumComment {
  const base = {
    id: comment.id,
    content: comment.content || '',
    gif: comment.gif
      ? {
          id: comment.gif.id,
          title: comment.gif.title,
          images: {
            original: {
              url: comment.gif.images.original.url,
              width: comment.gif.images.original.width,
              height: comment.gif.images.original.height,
            },
          },
        }
      : null,
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
    reactions: comment.reactions.map((reaction) => ({
      id: reaction.id,
      type: reaction.type as unknown as ReactionType,
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
  };

  return {
    ...base,
    quotedComment:
      includeQuoted && comment.quotedComment
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

    const post = (await prisma.forumPost.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        comments: {
          include: {
            author: true,
            quotedComment: {
              include: {
                author: true,
              },
            },
            reactions: {
              include: {
                user: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: true,
          },
        },
      },
    })) as unknown as PrismaPost | null;

    if (!post) {
      notFound();
    }

    // Transform the data to match our frontend types
    const transformedPost: ForumPost = {
      id: post.id,
      title: post.title,
      content: post.content || '',
      gif: post.gif
        ? {
            id: post.gif.id,
            title: post.gif.title,
            images: {
              original: {
                url: post.gif.images.original.url,
                width: post.gif.images.original.width,
                height: post.gif.images.original.height,
              },
            },
          }
        : null,
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
      reactions: post.reactions.map((reaction) => ({
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
      comments: post.comments.map((comment) => transformComment(comment)),
    };

    return <PostView league={league} post={transformedPost} />;
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  } finally {
    await prisma.$disconnect();
  }
}
