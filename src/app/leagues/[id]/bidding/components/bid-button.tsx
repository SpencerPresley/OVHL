'use client';

import { Button } from "@/components/ui/button";

interface BidButtonProps {
  playerId: string;
  onPlaceBid: (playerId: string) => void;
}

export function BidButton({ playerId, onPlaceBid }: BidButtonProps) {
  return (
    <Button 
      className="w-full" 
      variant="secondary"
      onClick={() => onPlaceBid(playerId)}
    >
      Place Bid
    </Button>
  );
} 