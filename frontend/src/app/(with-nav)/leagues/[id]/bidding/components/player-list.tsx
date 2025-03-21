'use client';

import { PlayerCard } from './player-card';
import { CompactPlayerCard } from './compact-player-card';
import { cn } from '@/lib/utils';
import { Bid } from '../types';

// interface Bid {
//   teamId: string;
//   teamName: string;
//   amount: number;
//   timestamp: number;
// }

interface PlayerListProps {
  players: Array<{
    id: string;
    name: string;
    position: string;
    gamertag: string;
    currentBid: number | null;
    currentTeamId: string | null;
    currentTeamName: string | null;
    bids: Bid[];
    endTime?: number;
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
  onPlaceBid: (playerId: string, amount: number) => void;
  canBid: boolean;
  isSubmitting: boolean;
  managedTeamId?: string | null;
  teamData?: {
    salaryCap: number;
    currentSalary: number;
    totalCommitted: number;
    activeBids: {
      playerSeasonId: string;
      playerName?: string;
      position?: string;
      amount: number;
      endTime?: number;
    }[];
    roster?: {
      id: string;
      name: string;
      position: string;
      gamertag: string;
      contractAmount: number;
    }[];
  } | null;
}

export function PlayerList({
  players,
  isDetailedView,
  onPlaceBid,
  canBid,
  isSubmitting,
  managedTeamId,
  teamData,
}: PlayerListProps) {
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
          <div key={player.id} id={`player-${player.id}`}>
            <PlayerCard
              player={player}
              onPlaceBid={onPlaceBid}
              canBid={canBid}
              isSubmitting={isSubmitting}
              managedTeamId={managedTeamId}
              teamData={teamData}
            />
          </div>
        ) : (
          <div key={player.id} id={`player-${player.id}`}>
            <CompactPlayerCard
              player={player}
              onPlaceBid={onPlaceBid}
              canBid={canBid}
              isSubmitting={isSubmitting}
              managedTeamId={managedTeamId}
              teamData={teamData}
            />
          </div>
        )
      )}

      {players.length === 0 && (
        <div className="col-span-full text-center py-10">
          <h3 className="text-xl font-semibold mb-2">No players match your filters</h3>
          <p className="text-gray-400">Try adjusting your filter criteria</p>
        </div>
      )}
    </div>
  );
}
