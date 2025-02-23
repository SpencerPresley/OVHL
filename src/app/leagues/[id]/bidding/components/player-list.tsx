'use client';

import { PlayerCard } from './player-card';
import { CompactPlayerCard } from './compact-player-card';
import { cn } from '@/lib/utils';

interface PlayerListProps {
  players: Array<{
    id: string;
    name: string;
    position: string;
    gamertag: string;
    currentBid: number | null;
    contract: {
      amount: number;
    };
    stats: {
      gamesPlayed: number;
      goals: number;
      assists: number;
      plusMinus: number;
    };
    player: {
      user: {
        id: string;
      };
    };
  }>;
  isDetailedView: boolean;
  onPlaceBid: (playerId: string) => void;
}

export function PlayerList({ players, isDetailedView, onPlaceBid }: PlayerListProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        isDetailedView
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      )}
    >
      {players.map((player) =>
        isDetailedView ? (
          <PlayerCard key={player.id} player={player} onPlaceBid={onPlaceBid} />
        ) : (
          <CompactPlayerCard key={player.id} player={player} onPlaceBid={onPlaceBid} />
        )
      )}
    </div>
  );
}
