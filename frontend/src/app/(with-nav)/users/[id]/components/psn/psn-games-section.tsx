'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Game } from '../../types/psn-types';
import { PSNGamesList } from './psn-games-list';

interface PSNGamesSectionProps {
  games: Game[];
}

export function PSNGamesSection({ games }: PSNGamesSectionProps) {
  // Sort games by last played
  const recentGames = [...games]
    .sort((a, b) => {
      if (!a.lastPlayed) return 1;
      if (!b.lastPlayed) return -1;
      return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
    })
    .slice(0, 5);

  // Get most played games (top 5 by playtime)
  const mostPlayedGames = [...games]
    .sort((a, b) => (b.playTimeMinutes || 0) - (a.playTimeMinutes || 0))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="recent">Recent Games</TabsTrigger>
          <TabsTrigger value="mostplayed">Most Played</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="pt-4">
          <PSNGamesList games={recentGames} />
        </TabsContent>

        <TabsContent value="mostplayed" className="pt-4">
          <PSNGamesList games={mostPlayedGames} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
