'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BidSection } from './bid-section';
import Link from 'next/link';
import { getPositionColors } from '@/lib/utils';

interface CompactPlayerCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    currentBid: number | null;
    player: {
      user: {
        id: string;
      };
    };
  };
  onPlaceBid: (playerId: string) => void;
}

export function CompactPlayerCard({ player, onPlaceBid }: CompactPlayerCardProps) {
  const positionColors = getPositionColors(player.position);

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
          <Link href={`/users/${player.player.user.id}`} className="hover:text-blue-400">
            <h3 className="font-semibold">{player.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground font-mono">
            {player.currentBid ? `$${player.currentBid.toLocaleString()}` : 'No Bids'}
          </p>
        </div>
      </div>

      <BidSection playerId={player.id} onPlaceBid={onPlaceBid} isCompact={true} />
    </div>
  );
}
