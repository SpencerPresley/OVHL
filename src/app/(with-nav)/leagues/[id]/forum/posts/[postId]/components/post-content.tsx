'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { MarkdownContent } from '@/components/markdown-content';
import { ForumPost, ReactionType } from '@/types/forum';
import { ReactionButtons } from './reaction-buttons';

interface PostContentProps {
  post: ForumPost;
  currentUser: { id: string; isAdmin: boolean } | null;
  onReaction: (type: ReactionType) => void;
  onDelete: () => void;
}

export function PostContent({ post, currentUser, onReaction, onDelete }: PostContentProps) {
  return (
    <Card className="card-gradient">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/users/${post.author.id}`}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {post.author.name}
            </Link>
            <span className="text-sm text-gray-400">
              {formatDistanceToNow(post.createdAt, {
                addSuffix: true,
              })}
            </span>
          </div>
          {currentUser?.isAdmin && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete Post
            </Button>
          )}
        </div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          {post.content && <MarkdownContent content={post.content} />}
          {post.gif && (
            <div className="mt-4">
              <Image
                src={post.gif.images?.original?.url || ''}
                alt={post.gif.title || 'GIF'}
                width={Number(post.gif.images?.original?.width) || 500}
                height={Number(post.gif.images?.original?.height) || 500}
                className="max-w-full rounded-lg"
                style={{ maxHeight: '400px', width: 'auto', height: 'auto' }}
              />
            </div>
          )}
        </div>
        <ReactionButtons
          reactions={post.reactions}
          currentUserId={currentUser?.id}
          onReact={onReaction}
        />
      </CardContent>
    </Card>
  );
}