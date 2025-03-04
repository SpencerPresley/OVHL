'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BidSection } from './bid-section';
import Link from 'next/link';
import { getPositionColors } from '@/lib/utils';
import { CountdownTimer } from './countdown-timer';

interface Bid {
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: number;
}

interface CompactPlayerCardProps {
  player: {
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
  };
  onPlaceBid: (playerId: string, amount: number) => void;
  canBid: boolean;
  isSubmitting: boolean;
  managedTeamId?: string | null;
}

export function CompactPlayerCard({ 
  player, 
  onPlaceBid, 
  canBid, 
  isSubmitting, 
  managedTeamId 
}: CompactPlayerCardProps) {
  const positionColors = getPositionColors(player.position);
  
  // Helper to prevent displaying player timer for players without active bids
  const hasActiveBid = Boolean(player.currentBid && player.endTime);

  // Add the logic to only show team name if it's the user's team
  const showTeamName = player.currentTeamId && managedTeamId && player.currentTeamId === managedTeamId;

  return (
    <div className="group flex items-center justify-between p-3 rounded-lg bg-black/20 backdrop-blur-sm border border-white/5 transition-all duration-200 hover:bg-black/30">
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={cn('font-semibold bg-black/30', {
            'text-red-400 border-red-400/30': player.position === 'C',
            'text-green-400 border-green-400/30': player.position === 'LW',
            'text-blue-400 border-blue-400/30': player.position === 'RW',
            'text-teal-400 border-teal-400/30': player.position === 'LD',
            'text-yellow-400 border-yellow-400/30': player.position === 'RD',
            'text-purple-400 border-purple-400/30': player.position === 'G',
          })}
        >
          {player.position}
        </Badge>
        <div>
          <div className="flex flex-col">
            {/* Player name with fallback */}
            <h3 className="font-semibold">{player.name}</h3>
            <span className="text-sm text-muted-foreground">{player.gamertag || player.name}</span>
          </div>
          <div className="flex gap-2 items-center mt-1">
            <p className="text-sm text-muted-foreground font-mono">
              {player.currentBid ? `$${player.currentBid.toLocaleString()}` : 'No Bids'}
            </p>
            {hasActiveBid && (
              <span className="text-xs">
                <CountdownTimer endTime={player.endTime!} />
              </span>
            )}
          </div>
          {showTeamName && (
            <p className="text-xs text-muted-foreground">{player.currentTeamName}</p>
          )}
        </div>
      </div>

      <BidSection 
        playerId={player.id} 
        onPlaceBid={onPlaceBid} 
        isCompact={true}
        canBid={canBid}
        currentBid={player.currentBid === null ? null : player.currentBid}
        startingAmount={player.contract.amount}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
