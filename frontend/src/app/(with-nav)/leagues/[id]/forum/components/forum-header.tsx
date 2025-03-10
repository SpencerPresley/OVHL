'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CreatePostDialog } from '../create-post-dialog';
import { useToast } from '@/hooks/use-toast';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface ForumHeaderProps {
  league: League;
  currentUser: { id: string; name: string } | null;
  onPostCreated: () => void;
}

export function ForumHeader({ league, currentUser, onPostCreated }: ForumHeaderProps) {
  const { toast } = useToast();

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

  return (
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
            onPostCreated={onPostCreated}
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
  );
}
