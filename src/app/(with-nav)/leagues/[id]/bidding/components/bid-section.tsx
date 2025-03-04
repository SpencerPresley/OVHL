'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface BidSectionProps {
  playerId: string;
  onPlaceBid: (playerId: string, amount: number) => void;
  canBid: boolean;
  currentBid: number | null;
  startingAmount: number; // Add the contract starting amount
  isCompact?: boolean;
  isSubmitting: boolean;
}

export function BidSection({ 
  playerId, 
  onPlaceBid, 
  canBid, 
  currentBid, 
  startingAmount,
  isCompact = false,
  isSubmitting
}: BidSectionProps) {
  // Define constants before any state initialization
  const BID_INCREMENT = 250000; // 250k increment

  // Function to calculate the next valid bid amount
  function calculateNextBid(currentAmount: number | null): number {
    // If no active bid yet, use the starting amount (contract)
    if (currentAmount === null) {
      return startingAmount;
    }
    
    // For subsequent bids, add 250k to the current amount
    const minBid = currentAmount + BID_INCREMENT;
    // Round to nearest 250k increment if needed
    return Math.ceil(minBid / BID_INCREMENT) * BID_INCREMENT;
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Default to minimum next bid based on whether this is first bid or not
  const [bidAmount, setBidAmount] = useState(calculateNextBid(currentBid));
  const [error, setError] = useState('');
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Update local bid amount when currentBid changes
  useEffect(() => {
    if (!isDialogOpen) {
      setBidAmount(calculateNextBid(currentBid));
    }
  }, [currentBid, isDialogOpen, startingAmount]);

  // Reset local submitting state when props change
  useEffect(() => {
    if (!isSubmitting) {
      setLocalIsSubmitting(false);
    }
  }, [isSubmitting]);

  const handleOpenDialog = () => {
    setBidAmount(calculateNextBid(currentBid)); // Reset to default on open
    setError('');
    setIsDialogOpen(true);
  };

  const handleSubmitBid = () => {
    // Different validation based on whether this is first bid or not
    if (currentBid === null) {
      // First bid - must be exactly the starting amount
      if (bidAmount !== startingAmount) {
        setError(`First bid must be exactly $${startingAmount.toLocaleString()} (the contract amount)`);
        return;
      }
    } else {
      // Subsequent bid - must be at least current + 250k
      if (bidAmount < currentBid + BID_INCREMENT) {
        setError(`Bid must be at least $${(currentBid + BID_INCREMENT).toLocaleString()} (current + $250,000)`);
        return;
      }

      // Validate that bid is in 250k increments
      if (bidAmount % BID_INCREMENT !== 0) {
        setError(`Bids must be in increments of $${BID_INCREMENT.toLocaleString()} (e.g. $750k, $1M, $1.25M)`);
        return;
      }
    }

    setLocalIsSubmitting(true);
    onPlaceBid(playerId, bidAmount);
    // Keep dialog open until we know the bid is confirmed
    // The dialog will be closed automatically when isSubmitting becomes false
  };

  // Close dialog when submission completes
  useEffect(() => {
    if (localIsSubmitting && !isSubmitting) {
      setIsDialogOpen(false);
    }
  }, [localIsSubmitting, isSubmitting]);

  return (
    <>
      <Button
        className={`transition-all duration-300 ${
          isCompact ? 'px-4' : 'w-full'
        } ${
          isButtonHovered && !isSubmitting && canBid 
            ? 'bg-white/15 border-white/20' 
            : 'bg-white/5 border-white/10'
        }`}
        variant="ghost"
        size={isCompact ? 'sm' : 'default'}
        onClick={handleOpenDialog}
        disabled={!canBid || isSubmitting}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          'Place Bid'
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        // Prevent closing dialog during submission
        if (localIsSubmitting && !open) return;
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Place a Bid</DialogTitle>
            <DialogDescription>
              {currentBid === null ? (
                `Enter your bid amount below. First bid must be exactly $${startingAmount.toLocaleString()} (the contract amount).`
              ) : (
                `Enter your bid amount below. The minimum bid is $${(currentBid + BID_INCREMENT).toLocaleString()}.
                Bids must be in $250,000 increments (e.g. $750k, $1M, $1.25M).`
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bidAmount">Bid Amount</Label>
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => {
                  setBidAmount(parseInt(e.target.value, 10) || 0);
                  setError('');
                }}
                className="bg-gray-800 border-gray-700"
                min={currentBid === null ? startingAmount : currentBid + BID_INCREMENT}
                step={currentBid === null ? startingAmount : BID_INCREMENT}
                disabled={localIsSubmitting}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex justify-between text-sm">
              <span>{currentBid === null ? 'Starting Amount:' : 'Current Bid:'}</span>
              <span>${(currentBid === null ? startingAmount : currentBid).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Your Bid:</span>
              <span>${bidAmount.toLocaleString()}</span>
            </div>

            {currentBid !== null && (
              <div className="flex justify-between text-sm">
                <span>Increase:</span>
                <span 
                  className={bidAmount >= currentBid + BID_INCREMENT ? 'text-green-500' : 'text-red-500'}
                >
                  {bidAmount >= currentBid + BID_INCREMENT
                    ? `$${(bidAmount - currentBid).toLocaleString()} (+${Math.round((bidAmount - currentBid) / currentBid * 100)}%)`
                    : 'Invalid bid amount'
                  }
                </span>
              </div>
            )}

            <div className="text-sm text-gray-400 bg-gray-800/50 p-2 rounded border border-gray-700">
              <p className="font-medium mb-1">Bidding Rules:</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>First bid must be exactly the contract amount (usually $500,000)</li>
                <li>Subsequent bids must use $250,000 increments (e.g. $750k, $1M, $1.25M)</li>
                <li>Minimum increase between bids is $250,000</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-700"
              disabled={localIsSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBid}
              disabled={(currentBid === null ? bidAmount !== startingAmount : bidAmount < currentBid + BID_INCREMENT) || localIsSubmitting}
              className={localIsSubmitting ? 'opacity-80' : ''}
            >
              {localIsSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Place Bid'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
