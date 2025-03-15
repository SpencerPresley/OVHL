'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Game } from '../../types/psn-types';
import { PSNGamesList } from './psn-games-list';

interface PSNGamesSectionProps {
  games: Game[];
}

export function PSNGamesSection({ games }: PSNGamesSectionProps) {
  const [activeTab, setActiveTab] = useState('recent');

  // Sort games by last played
  const sortedGames = [...games].sort((a, b) => {
    if (!a.lastPlayed) return 1;
    if (!b.lastPlayed) return -1;
    return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
  });

  // Get recent games (last 5)
  const recentGames = sortedGames.slice(0, 5);

  // Get most played games (top 5 by playtime)
  const mostPlayedGames = [...games]
    .sort((a, b) => (b.playTimeMinutes || 0) - (a.playTimeMinutes || 0))
    .slice(0, 5);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="recent">Recent Games</TabsTrigger>
        <TabsTrigger value="mostplayed">Most Played</TabsTrigger>
        <TabsTrigger value="all">All Games</TabsTrigger>
      </TabsList>

      {/* Recent Games Tab */}
      <TabsContent value="recent" className="pt-4">
        <PSNGamesList games={recentGames} />
      </TabsContent>

      {/* Most Played Games Tab */}
      <TabsContent value="mostplayed" className="pt-4">
        <PSNGamesList games={mostPlayedGames} />
      </TabsContent>

      {/* All Games Tab */}
      <TabsContent value="all" className="pt-4">
        <PSNGamesList games={sortedGames} totalGamesCount={games.length} />
      </TabsContent>
    </Tabs>
  );
}
