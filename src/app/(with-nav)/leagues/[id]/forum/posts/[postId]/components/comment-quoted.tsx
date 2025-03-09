'use client';

import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ForumComment } from '@/types/forum';
import { MarkdownContent } from '@/components/markdown-content';

interface CommentQuotedProps {
  quotedComment: ForumComment;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onScrollToComment: () => void;
}

export function CommentQuoted({
  quotedComment,
  isExpanded,
  onToggleExpansion,
  onScrollToComment,
}: CommentQuotedProps) {
  if (!quotedComment) return null;

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="mb-4">
      <div
        className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={onScrollToComment}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-400">{quotedComment.author.name} wrote:</span>
          {quotedComment.content && quotedComment.content.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpansion();
              }}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
        <div className="text-gray-300">
          {quotedComment.content && (
            <MarkdownContent
              content={isExpanded ? quotedComment.content : truncateText(quotedComment.content)}
            />
          )}
        </div>
      </div>
    </div>
  );
}