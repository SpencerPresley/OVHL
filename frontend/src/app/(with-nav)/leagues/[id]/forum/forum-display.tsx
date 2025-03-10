'use client';

import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ForumPost } from '@/types/forum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CreatePostDialog } from './create-post-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface ForumDisplayProps {
  league: League;
  initialPosts: ForumPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
  };
}

export function ForumDisplay({ league, initialPosts, pagination }: ForumDisplayProps) {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();
  }, []);

  const refreshPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/leagues/${league.id}/forum/posts?page=${pagination.currentPage}`
      );
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to create a post.',
        variant: 'destructive',
      });
      return;
    }
  };

  const handlePageChange = (page: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', page.toString());
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  return (
    <div className="min-h-screen">
      {/* League Banner */}
      <div className={`w-full ${league.bannerColor} py-8`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Image
              src={league.logo}
              alt={`${league.name} Logo`}
              width={80}
              height={80}
              className="object-contain"
            />
            <h1 className="text-4xl font-bold text-white">{league.name} Forum</h1>
          </div>
          {currentUser ? (
            <CreatePostDialog
              leagueId={league.id}
              userId={currentUser.id}
              onPostCreated={refreshPosts}
              trigger={
                <Button variant="secondary" size="lg">
                  Create New Post
                </Button>
              }
            />
          ) : (
            <Button variant="secondary" size="lg" onClick={handleCreatePost}>
              Create New Post
            </Button>
          )}
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* Forum Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/leagues/${league.id}/forum/posts/${post.id}`}>
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {pagination.currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pagination.currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, and pages around current page
                    const diff = Math.abs(page - pagination.currentPage);
                    return diff <= 1 || page === 1 || page === pagination.totalPages;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis where there are gaps
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <span className="px-4 text-gray-400">...</span>
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={page === pagination.currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                {pagination.currentPage < pagination.totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pagination.currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
