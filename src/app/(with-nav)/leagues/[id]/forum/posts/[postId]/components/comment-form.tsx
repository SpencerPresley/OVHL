'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MarkdownEditor } from '@/components/markdown-editor';
import { MarkdownContent } from '@/components/markdown-content';
import { ForumComment } from '@/types/forum';
import { ImageIcon } from 'lucide-react';
import { IGif } from '@giphy/js-types';
import GifPicker from '@/components/chatbox/gif-picker';

interface CommentFormProps {
  quotedComment: ForumComment | null;
  onCancelQuote: () => void;
  isLoading: boolean;
  isMobile: boolean;
  onSubmit: (e: React.FormEvent) => void;
  comment: string;
  setComment: (value: string) => void;
  onGifSelect: (gif: IGif) => void;
}

export function CommentForm({
  quotedComment,
  onCancelQuote,
  isLoading,
  isMobile,
  onSubmit,
  comment,
  setComment,
  onGifSelect,
}: CommentFormProps) {
  const [showGifPicker, setShowGifPicker] = useState(false);

  const renderTruncatedContent = (content: string | null, length: number = 300) => {
    if (!content) return null;
    const truncated = content.length > length ? content.slice(0, length) + '...' : content;
    return <MarkdownContent content={truncated} />;
  };

  return (
    <div className="mt-6 pt-6 border-t-2 border-gray-800">
      <Card className="card-gradient">
        <CardContent className="p-4">
          {quotedComment && quotedComment.content && (
            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                  Quoting {quotedComment.author.name}:
                </span>
                <Button variant="ghost" size="sm" onClick={onCancelQuote}>
                  Cancel Quote
                </Button>
              </div>
              <div className="text-gray-300">
                {quotedComment?.content && renderTruncatedContent(quotedComment.content, 300)}
              </div>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <MarkdownEditor
              value={comment}
              onChange={setComment}
              placeholder="Write your comment... You can use markdown for formatting."
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {isMobile ? (
                  <Dialog open={showGifPicker} onOpenChange={setShowGifPicker}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className="gap-2">
                        <ImageIcon className="w-4 h-4" />
                        GIF
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0">
                      <GifPicker
                        onGifSelect={onGifSelect}
                        onClose={() => setShowGifPicker(false)}
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Popover open={showGifPicker} onOpenChange={setShowGifPicker}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className="gap-2">
                        <ImageIcon className="w-4 h-4" />
                        GIF
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto" align="start" side="top">
                      <GifPicker
                        onGifSelect={onGifSelect}
                        onClose={() => setShowGifPicker(false)}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <Button type="submit" disabled={isLoading || !comment.trim()}>
                {isLoading ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}