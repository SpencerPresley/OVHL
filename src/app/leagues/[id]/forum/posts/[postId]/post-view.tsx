'use client';

import { Nav } from '@/components/nav';
import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ForumPost, ForumComment, ReactionType } from '@/types/forum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { IGif } from '@giphy/js-types';
import { useIsMobile } from '@/hooks/use-mobile';
import GifPicker from '@/components/chatbox/gif-picker';
import {
  MessageSquare,
  ThumbsUp,
  Quote,
  Heart,
  ThumbsDown,
  Laugh,
  Brain,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MarkdownContent } from '@/components/markdown-content';
import { MarkdownEditor } from '@/components/markdown-editor';

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
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();

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

      setShowGifPicker(false);
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

  const reactionButtons = [
    { type: ReactionType.LIKE, icon: ThumbsUp },
    { type: ReactionType.DISLIKE, icon: ThumbsDown },
    { type: ReactionType.LAUGH, icon: Laugh },
    { type: ReactionType.THINKING, icon: Brain },
    { type: ReactionType.HEART, icon: Heart },
  ];

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

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const renderQuotedContent = (content: string | null) => {
    if (!content) return null;
    return <MarkdownContent content={content} />;
  };

  const renderTruncatedContent = (content: string | null, length?: number) => {
    if (!content) return null;
    return <MarkdownContent content={truncateText(content, length)} />;
  };

  return (
    <div className="min-h-screen">
      <Nav />

      {/* League Banner */}
      <div className={`w-full ${league.bannerColor} py-8`}>
        <div className="container mx-auto px-4 flex items-center gap-8">
          <Image
            src={league.logo}
            alt={`${league.name} Logo`}
            width={80}
            height={80}
            className="object-contain"
          />
          <Link
            href={`/leagues/${league.id}/forum`}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            {league.name} Forum
          </Link>
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* Post Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Post Card */}
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
                  <Button variant="destructive" size="sm" onClick={() => handleDelete()}>
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
              <div className="flex items-center gap-2">
                {reactionButtons.map(({ type, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(type)}
                    className={`gap-1 ${
                      post.reactions?.some((r) => r.type === type && r.userId === currentUser?.id)
                        ? 'text-blue-400'
                        : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{post.reactions?.filter((r) => r.type === type).length || 0}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className="ml-4 pl-6 border-l-2 border-gray-800">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments
            </h2>
            <div className="space-y-4">
              {post.comments?.map((comment) => (
                <div key={comment.id} id={`comment-${comment.id}`} className="scroll-mt-24">
                  <Card className="card-gradient">
                    <CardContent className="p-4">
                      {comment.quotedComment && (
                        <div className="mb-4">
                          <div
                            className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                            onClick={() => {
                              const element = document.getElementById(
                                `comment-${comment.quotedComment!.id}`
                              );
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
                            }}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-400">
                                {comment.quotedComment.author.name} wrote:
                              </span>
                              {comment.quotedComment.content &&
                                comment.quotedComment.content.length > 150 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleQuoteExpansion(comment.id);
                                    }}
                                  >
                                    {expandedQuotes.has(comment.id) ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </Button>
                                )}
                            </div>
                            <div className="text-gray-300">
                              {comment.quotedComment?.content &&
                                (expandedQuotes.has(comment.id)
                                  ? renderQuotedContent(comment.quotedComment.content)
                                  : renderTruncatedContent(comment.quotedComment.content))}
                            </div>
                          </div>
                        </div>
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
                            {formatDistanceToNow(comment.createdAt, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuotedComment(comment)}
                            className="gap-1"
                          >
                            <Quote className="w-4 h-4" />
                            Quote
                          </Button>
                          {currentUser?.isAdmin && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(comment.id)}
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
                      <div className="flex items-center gap-2">
                        {reactionButtons.map(({ type, icon: Icon }) => (
                          <Button
                            key={type}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(type, comment.id)}
                            className={`gap-1 ${
                              comment.reactions?.some(
                                (r) => r.type === type && r.userId === currentUser?.id
                              )
                                ? 'text-blue-400'
                                : ''
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>
                              {comment.reactions?.filter((r) => r.type === type).length || 0}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Form */}
          <div className="mt-6 pt-6 border-t-2 border-gray-800">
            <Card className="card-gradient">
              <CardContent className="p-4">
                {quotedComment && quotedComment.content && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">
                        Quoting {quotedComment.author.name}:
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setQuotedComment(null)}>
                        Cancel Quote
                      </Button>
                    </div>
                    <div className="text-gray-300">
                      {quotedComment?.content && renderTruncatedContent(quotedComment.content, 300)}
                    </div>
                  </div>
                )}
                <form onSubmit={handleComment} className="space-y-4">
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
                              onGifSelect={handleGifComment}
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
                              onGifSelect={handleGifComment}
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
        </div>
      </div>
    </div>
  );
}
