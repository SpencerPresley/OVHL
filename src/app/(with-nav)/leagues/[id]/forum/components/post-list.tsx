import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ForumPost } from '@/types/forum';

interface PostListProps {
  posts: ForumPost[];
  leagueId: string;
}

export function PostList({ posts, leagueId }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link key={post.id} href={`/leagues/${leagueId}/forum/posts/${post.id}`}>
          <Card className="card-gradient card-hover">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{post.title}</h2>
                  <p className="text-sm text-gray-400">
                    Posted by {post.author.name} •{' '}
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 line-clamp-2 mb-4">{post.content}</p>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post._count?.comments || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post._count?.reactions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}