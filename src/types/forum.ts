import {
  ForumPostStatus as PrismaForumPostStatus,
  ReactionType as PrismaReactionType,
} from '@prisma/client';

// Re-export the enums as values and types
export { PrismaForumPostStatus as ForumPostStatus, PrismaReactionType as ReactionType };

export interface GifData {
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

export interface ForumUser {
  id: string;
  name: string;
  username: string;
}

export interface ForumReaction {
  id: string;
  type: PrismaReactionType;
  createdAt: Date;
  userId: string;
  postId?: string;
  commentId?: string;
  user: ForumUser;
}

export interface ForumComment {
  id: string;
  content: string;
  gif: GifData | null;
  createdAt: Date;
  updatedAt: Date;
  status: PrismaForumPostStatus;
  authorId: string;
  postId: string;
  quotedCommentId: string | null;
  author: ForumUser;
  quotedComment: ForumComment | null;
  reactions: ForumReaction[];
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  gif: GifData | null;
  createdAt: Date;
  updatedAt: Date;
  status: PrismaForumPostStatus;
  authorId: string;
  leagueId: string;
  author: ForumUser;
  comments: ForumComment[];
  reactions: ForumReaction[];
  _count?: {
    comments: number;
    reactions: number;
  };
}
