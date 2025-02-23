'use client';

import { Button } from '@/components/ui/button';

interface BidSectionProps {
  playerId: string;
  onPlaceBid: (playerId: string) => void;
  isCompact?: boolean;
}

export function BidSection({ playerId, onPlaceBid, isCompact = false }: BidSectionProps) {
  const handlePlaceBid = () => {
    // Here you would:
    // 1. Show a dialog for bid amount
    // 2. Submit the bid
    // 3. Update the currentBid state immediately for optimistic UI
    // 4. Handle any errors and rollback if needed
    onPlaceBid(playerId);
  };

  return (
    <Button
      className={`bg-white/5 hover:bg-white/10 border border-white/10 ${isCompact ? 'px-4' : 'w-full'}`}
      variant="ghost"
      size={isCompact ? 'sm' : 'default'}
      onClick={handlePlaceBid}
    >
      Place Bid
    </Button>
  );
}
