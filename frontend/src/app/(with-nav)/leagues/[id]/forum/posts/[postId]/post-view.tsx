'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ForumPost, ForumComment, ReactionType } from '@/types/forum';
import { IGif } from '@giphy/js-types';

// Import extracted components
import { PostHeader } from './components/post-header';
import { PostContent } from './components/post-content';
import { CommentList } from './components/comment-list';
import { CommentForm } from './components/comment-form';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface PostViewProps {
  league: League;
  post: ForumPost;
}

export function PostView({ league, post: initialPost }: PostViewProps) {
  const [post, setPost] = useState<ForumPost>(initialPost);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    isAdmin: boolean;
  } | null>(null);
  const [comment, setComment] = useState('');
  const [quotedComment, setQuotedComment] = useState<ForumComment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set());
  // Add auth loading state
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      setAuthLoading(true); // Start loading state
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          console.log('Auth data received:', data); // Debug logging
          setCurrentUser(data.user);
        } else {
          console.error('Auth response not OK:', await response.text());
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setAuthLoading(false); // End loading state
      }
    };

    checkAuth();
  }, []);

  const refreshPost = async () => {
    try {
      const response = await fetch(`/api/leagues/${league.id}/forum/posts/${post.id}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error('Error refreshing post:', error);
    }
  };

  const handleReaction = async (type: ReactionType, commentId?: string) => {
    // Check auth loading state first
    if (authLoading) {
      toast({
        title: 'Please wait',
        description: 'Still checking your authentication status.',
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to react to posts.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/leagues/${league.id}/forum/posts/${post.id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          commentId,
          userId: currentUser.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add reaction');
      await refreshPost();
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reaction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Comment submitted, auth state:', { authLoading, currentUser }); // Debug log

    // Check auth loading state first
    if (authLoading) {
      toast({
        title: 'Please wait',
        description: 'Still checking your authentication status.',
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to comment.',
        variant: 'destructive',
      });
      return;
    }

    if (!comment.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/leagues/${league.id}/forum/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment.trim(),
          authorId: currentUser.id,
          quotedCommentId: quotedComment?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      toast({
        title: 'Comment Added',
        description: 'Your comment has been added successfully.',
      });

      setComment('');
      setQuotedComment(null);
      await refreshPost();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGifComment = async (gif: IGif) => {
    // Check auth loading state first
    if (authLoading) {
      toast({
        title: 'Please wait',
        description: 'Still checking your authentication status.',
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to comment.',
        variant: 'destructive',
      });
      return;
    }

    if (!gif.images?.original?.url) {
      toast({
        title: 'Error',
        description: 'Invalid GIF data. Please try another GIF.',
        variant: 'destructive',
      });
      return;
    }

    const gifData = {
      id: gif.id,
      images: {
        original: {
          url: gif.images.original.url,
          width: gif.images.original.width,
          height: gif.images.original.height,
        },
      },
      title: gif.title || 'GIF',
    };

    setIsLoading(true);
    try {
      const response = await fetch(`/api/leagues/${league.id}/forum/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gif: gifData,
          authorId: currentUser.id,
          quotedCommentId: quotedComment?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add GIF comment');

      toast({
        title: 'GIF Added',
        description: 'Your GIF has been added successfully.',
      });

      setQuotedComment(null);
      await refreshPost();
    } catch (error) {
      console.error('Error adding GIF comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add GIF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId?: string) => {
    if (!currentUser?.isAdmin) return;

    try {
      const response = await fetch(
        `/api/leagues/${league.id}/forum/posts/${commentId ? `${post.id}/comments/${commentId}` : post.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete');

      toast({
        title: `${commentId ? 'Comment' : 'Post'} Deleted`,
        description: `The ${commentId ? 'comment' : 'post'} has been deleted successfully.`,
      });

      if (!commentId) {
        router.push(`/leagues/${league.id}/forum`);
      } else {
        await refreshPost();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleQuoteExpansion = (commentId: string) => {
    setExpandedQuotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen">
      <PostHeader league={league} />

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <PostContent
            post={post}
            currentUser={currentUser}
            onReaction={(type) => handleReaction(type)}
            onDelete={() => handleDelete()}
          />

          <CommentList
            comments={post.comments}
            currentUser={currentUser}
            expandedQuotes={expandedQuotes}
            onQuote={setQuotedComment}
            onReaction={handleReaction}
            onDelete={handleDelete}
            onToggleQuoteExpansion={toggleQuoteExpansion}
          />

          {authLoading ? (
            <div className="mt-6 pt-6 border-t-2 border-gray-800">
              <div className="p-4 text-center text-gray-400">Checking authentication status...</div>
            </div>
          ) : (
            <CommentForm
              quotedComment={quotedComment}
              onCancelQuote={() => setQuotedComment(null)}
              isLoading={isLoading}
              isMobile={isMobile}
              onSubmit={handleComment}
              comment={comment}
              setComment={setComment}
              onGifSelect={handleGifComment}
            />
          )}
        </div>
      </div>
    </div>
  );
}
