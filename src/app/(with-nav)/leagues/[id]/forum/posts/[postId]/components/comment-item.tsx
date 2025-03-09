'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { MarkdownContent } from '@/components/markdown-content';
import { ForumComment, ReactionType } from '@/types/forum';
import { ReactionButtons } from './reaction-buttons';
import { CommentQuoted } from './comment-quoted';
import { Quote } from 'lucide-react';

interface CommentItemProps {
  comment: ForumComment;
  currentUser: { id: string; isAdmin: boolean } | null;
  expandedQuotes: Set<string>;
  onQuote: (comment: ForumComment) => void;
  onReaction: (type: ReactionType, commentId: string) => void;
  onDelete: (commentId: string) => void;
  onToggleQuoteExpansion: (commentId: string) => void;
}

export function CommentItem({
  comment,
  currentUser,
  expandedQuotes,
  onQuote,
  onReaction,
  onDelete,
  onToggleQuoteExpansion,
}: CommentItemProps) {
  const scrollToComment = () => {
    if (!comment.quotedComment) return;
    
    const element = document.getElementById(`comment-${comment.quotedComment.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const card = element.querySelector('.card-gradient');
      if (card) {
        card.classList.add('ring-2', 'ring-blue-500');
        setTimeout(() => {
          card.classList.remove('ring-2', 'ring-blue-500');
        }, 2000);
      }
    }
  };

  return (
    <div id={`comment-${comment.id}`} className="scroll-mt-24">
      <Card className="card-gradient">
        <CardContent className="p-4">
          {comment.quotedComment && (
            <CommentQuoted
              quotedComment={comment.quotedComment}
              isExpanded={expandedQuotes.has(comment.id)}
              onToggleExpansion={() => onToggleQuoteExpansion(comment.id)}
              onScrollToComment={scrollToComment}
            />
          )}
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link
                href={`/users/${comment.author.id}`}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {comment.author.name}
              </Link>
              <span className="text-sm text-gray-400 ml-2">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuote(comment)}
                className="gap-1"
              >
                <Quote className="w-4 h-4" />
                Quote
              </Button>
              {currentUser?.isAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(comment.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            {comment.content && <MarkdownContent content={comment.content} />}
            {comment.gif && (
              <div className="mt-4">
                <Image
                  src={comment.gif.images?.original?.url || ''}
                  alt={comment.gif.title || 'GIF'}
                  width={Number(comment.gif.images?.original?.width) || 500}
                  height={Number(comment.gif.images?.original?.height) || 500}
                  className="max-w-full rounded-lg"
                  style={{ maxHeight: '300px', width: 'auto', height: 'auto' }}
                />
              </div>
            )}
          </div>
          
          <ReactionButtons
            reactions={comment.reactions}
            currentUserId={currentUser?.id}
            onReact={(type) => onReaction(type, comment.id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}