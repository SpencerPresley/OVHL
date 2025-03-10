'use client';

import { ForumComment, ReactionType } from '@/types/forum';
import { CommentItem } from './comment-item';
import { MessageSquare } from 'lucide-react';

interface CommentListProps {
  comments: ForumComment[];
  currentUser: { id: string; isAdmin: boolean } | null;
  expandedQuotes: Set<string>;
  onQuote: (comment: ForumComment) => void;
  onReaction: (type: ReactionType, commentId: string) => void;
  onDelete: (commentId: string) => void;
  onToggleQuoteExpansion: (commentId: string) => void;
}

export function CommentList({
  comments,
  currentUser,
  expandedQuotes,
  onQuote,
  onReaction,
  onDelete,
  onToggleQuoteExpansion,
}: CommentListProps) {
  return (
    <div className="ml-4 pl-6 border-l-2 border-gray-800">
      <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments
      </h2>
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            expandedQuotes={expandedQuotes}
            onQuote={onQuote}
            onReaction={onReaction}
            onDelete={onDelete}
            onToggleQuoteExpansion={onToggleQuoteExpansion}
          />
        ))}
      </div>
    </div>
  );
}
