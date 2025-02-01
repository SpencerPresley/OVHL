export enum ReactionType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  LAUGH = 'LAUGH',
  THINKING = 'THINKING',
  HEART = 'HEART',
}

export enum ForumPostStatus {
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED',
}

export interface ForumGif {
  id: string;
  url: string;
  title: string;
  width: number;
  height: number;
}

export interface ForumUser {
  id: string;
  name: string | null;
  username: string;
}

export interface ForumReaction {
  id: string;
  type: ReactionType;
  createdAt: Date;
  userId: string;
  postId: string | null;
  commentId: string | null;
  user: ForumUser;
}

export interface ForumComment {
  id: string;
  content: string | null;
  gif: ForumGif | null;
  createdAt: Date;
  updatedAt: Date;
  status: ForumPostStatus;
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
  content: string | null;
  gif: ForumGif | null;
  createdAt: Date;
  updatedAt: Date;
  status: ForumPostStatus;
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
