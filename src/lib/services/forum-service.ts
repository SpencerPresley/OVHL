import { prisma } from '../prisma';
import { ForumPostStatus, ReactionType } from '@prisma/client';

const forumAuthorSelect = {
  id: true,
  name: true,
  username: true,
} as const;

const forumReactionInclude = {
  user: {
    select: forumAuthorSelect,
  },
} as const;

export class ForumService {
  static readonly PostInclude = {
    author: {
      select: forumAuthorSelect,
    },
    comments: {
      where: { status: ForumPostStatus.PUBLISHED },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: forumAuthorSelect,
        },
        quotedComment: {
          include: {
            author: {
              select: forumAuthorSelect,
            },
          },
        },
        reactions: {
          include: forumReactionInclude,
        },
      },
    },
    reactions: {
      include: forumReactionInclude,
    },
  } as const;

  static readonly PostListInclude = {
    author: {
      select: forumAuthorSelect,
    },
    _count: {
      select: {
        comments: true,
        reactions: true,
      },
    },
  } as const;

  static async getLeaguePosts(leagueId: string, take: number = 20) {
    return prisma.forumPost.findMany({
      where: {
        leagueId,
        status: ForumPostStatus.PUBLISHED,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      include: this.PostListInclude,
    });
  }

  static async createPost(data: {
    title: string;
    content: string;
    authorId: string;
    leagueId: string;
  }) {
    return prisma.forumPost.create({
      data,
      include: {
        author: {
          select: forumAuthorSelect,
        },
      },
    });
  }

  static async getPost(postId: string) {
    return prisma.forumPost.findUnique({
      where: {
        id: postId,
        status: ForumPostStatus.PUBLISHED,
      },
      include: this.PostInclude,
    });
  }

  static async getPostBasicInfo(postId: string) {
    return prisma.forumPost.findUnique({
      where: {
        id: postId,
        status: ForumPostStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });
  }

  static async getComments(postId: string) {
    return prisma.forumComment.findMany({
      where: {
        postId,
        status: ForumPostStatus.PUBLISHED,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: {
          select: forumAuthorSelect,
        },
        quotedComment: {
          include: {
            author: {
              select: forumAuthorSelect,
            },
          },
        },
        reactions: {
          include: forumReactionInclude,
        },
      },
    });
  }

  static async createComment(data: {
    content?: string;
    authorId: string;
    postId: string;
    quotedCommentId?: string;
    gif?: any;
  }) {
    // Ensure content is never undefined/empty when creating a comment
    const commentData = {
      ...data,
      content: data.content || '', // Default to empty string if no content
    };

    return prisma.forumComment.create({
      data: commentData,
      include: {
        author: {
          select: forumAuthorSelect,
        },
        quotedComment: {
          include: {
            author: {
              select: forumAuthorSelect,
            },
          },
        },
        reactions: {
          include: forumReactionInclude,
        },
      },
    });
  }

  static async upsertSubscription(userId: string, postId: string) {
    return prisma.forumPostSubscription.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      create: {
        userId,
        postId,
      },
      update: {},
    });
  }

  static async getSubscribers(postId: string) {
    return prisma.forumPostSubscription.findMany({
      where: {
        postId,
      },
      include: {
        user: true,
      },
    });
  }

  static async findReaction(data: {
    userId: string;
    type: ReactionType;
    postId?: string;
    commentId?: string;
  }) {
    return prisma.forumReaction.findFirst({
      where: {
        userId: data.userId,
        type: data.type,
        ...(data.commentId ? { commentId: data.commentId } : { postId: data.postId }),
      },
    });
  }

  static async deleteReaction(reactionId: string) {
    return prisma.forumReaction.delete({
      where: {
        id: reactionId,
      },
    });
  }

  static async createReaction(data: {
    type: ReactionType;
    userId: string;
    postId?: string;
    commentId?: string;
  }) {
    return prisma.forumReaction.create({
      data,
      include: {
        user: {
          select: forumAuthorSelect,
        },
      },
    });
  }

  static async verifyPostExists(postId: string) {
    const post = await prisma.forumPost.findUnique({
      where: {
        id: postId,
        status: ForumPostStatus.PUBLISHED,
      },
    });
    return !!post;
  }

  static async verifyCommentExists(commentId: string, postId: string) {
    const comment = await prisma.forumComment.findUnique({
      where: {
        id: commentId,
        postId,
        status: ForumPostStatus.PUBLISHED,
      },
    });
    return !!comment;
  }
}
