import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BidSection } from './bid-section';
import Link from 'next/link';
import { getPositionColors } from '@/lib/utils';
import { CountdownTimer } from './countdown-timer';

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    gamertag: string;
    currentBid: number | null;
    currentTeamId: string | null;
    currentTeamName: string | null;
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
      user?: {
        id: string;
      };
    } | null;
    endTime?: number;
  };
  onPlaceBid: (playerId: string, amount: number) => void;
  canBid: boolean;
  isSubmitting: boolean;
  managedTeamId?: string | null;
}

export function PlayerCard({
  player,
  onPlaceBid,
  canBid,
  isSubmitting,
  managedTeamId,
}: PlayerCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const positionColors = getPositionColors(player.position);

  // Helper to prevent displaying player timer for players without active bids
  const hasActiveBid = Boolean(player.currentBid && player.endTime);

  // Only show team name if it's the user's team
  const showTeamName =
    player.currentTeamId && managedTeamId && player.currentTeamId === managedTeamId;

  return (
    <div className="group">
      <div className="relative p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/5 transition-all duration-200 group-hover:bg-black/30">
        <div className="flex justify-between items-start mb-3">
          <div>
            {/* Player name with fallback */}
            <h3 className="font-semibold text-lg">{player.name}</h3>
            <p className="text-sm text-muted-foreground">{player.gamertag || player.name}</p>
          </div>
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
        </div>

        {/* Bid Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 rounded-lg bg-black/30 border border-white/5">
            <p className="text-sm text-muted-foreground">Current Bid</p>
            <p className="font-mono font-bold">
              {player.currentBid ? `$${player.currentBid.toLocaleString()}` : 'No Bids'}
            </p>
            {hasActiveBid && (
              <p className="text-xs mt-1">
                <CountdownTimer endTime={player.endTime!} />
              </p>
            )}
          </div>
          <div className="text-center p-2 rounded-lg bg-black/30 border border-white/5">
            <p className="text-sm text-muted-foreground">Min Contract</p>
            <p className="font-mono font-bold">${player.contract.amount.toLocaleString()}</p>
            {/* Only show team name if it matches the user's team */}
            {showTeamName && player.currentTeamName && (
              <p className="text-xs text-gray-400 mt-1">{player.currentTeamName}</p>
            )}
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-4 gap-2 text-center mb-4">
          <div className="p-2 rounded-lg bg-black/30 border border-white/5">
            <p className="text-xs text-muted-foreground">GP</p>
            <p className="font-medium">{player.stats?.gamesPlayed || 0}</p>
          </div>
          <div className="p-2 rounded-lg bg-black/30 border border-white/5">
            <p className="text-xs text-muted-foreground">G</p>
            <p className="font-medium">{player.stats?.goals || 0}</p>
          </div>
          <div className="p-2 rounded-lg bg-black/30 border border-white/5">
            <p className="text-xs text-muted-foreground">A</p>
            <p className="font-medium">{player.stats?.assists || 0}</p>
          </div>
          <div className="p-2 rounded-lg bg-black/30 border border-white/5">
            <p className="text-xs text-muted-foreground">+/-</p>
            <p
              className={cn('font-medium', {
                'text-green-400': (player.stats?.plusMinus || 0) > 0,
                'text-red-400': (player.stats?.plusMinus || 0) < 0,
              })}
            >
              {(player.stats?.plusMinus || 0) > 0
                ? `+${player.stats?.plusMinus}`
                : player.stats?.plusMinus || 0}
            </p>
          </div>
        </div>

        {/* Bid Button */}
        <BidSection
          playerId={player.id}
          onPlaceBid={onPlaceBid}
          canBid={canBid}
          isSubmitting={isSubmitting}
          currentBid={player.currentBid === null ? null : player.currentBid}
          startingAmount={player.contract.amount}
        />
      </div>
    </div>
  );
}
