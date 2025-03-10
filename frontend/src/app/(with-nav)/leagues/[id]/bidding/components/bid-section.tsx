'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  playerPosition?: string; // Add player position
}

export function BidSection({
  playerId,
  onPlaceBid,
  canBid,
  currentBid,
  startingAmount,
  isCompact = false,
  isSubmitting,
  teamData,
  playerPosition,
}: BidSectionProps) {
  // Define constants before any state initialization
  const BID_INCREMENT = 250000; // 250k increment
  const DEFAULT_STARTING_AMOUNT = 500000; // 500k default starting amount
  const MIN_SALARY = 500000; // Minimum contract of $500k
  const MIN_FORWARDS = 9;
  const MIN_DEFENSE = 6;
  const MIN_GOALIES = 2;

  // Function to calculate the next valid bid amount
  function calculateNextBid(currentAmount: number | null): number {
    // If no active bid yet, use the starting amount (contract) or default to 500k
    if (currentAmount === null) {
      return startingAmount || DEFAULT_STARTING_AMOUNT;
    }

    // For subsequent bids, add 250k to the current amount
    const minBid = currentAmount + BID_INCREMENT;
    // Round to nearest 250k increment if needed
    return Math.ceil(minBid / BID_INCREMENT) * BID_INCREMENT;
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Default to minimum next bid based on whether this is first bid or not
  const [bidAmount, setBidAmount] = useState(calculateNextBid(currentBid));
  // Add a state for raw input to allow empty field
  const [rawInputValue, setRawInputValue] = useState('');
  const [error, setError] = useState('');
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Update local bid amount when currentBid changes
  useEffect(() => {
    if (!isDialogOpen) {
      const nextBid = calculateNextBid(currentBid);
      setBidAmount(nextBid);
      setRawInputValue(nextBid.toString());
    }
  }, [currentBid, isDialogOpen, startingAmount]);

  // Reset local submitting state when props change
  useEffect(() => {
    if (!isSubmitting) {
      setLocalIsSubmitting(false);
    }
  }, [isSubmitting]);

  const handleOpenDialog = () => {
    const nextBid = calculateNextBid(currentBid);
    setBidAmount(nextBid); // Reset to default on open
    setRawInputValue(nextBid.toString());

    // Validate the initial amount
    if (teamData) {
      setError(validateBidAmount(nextBid.toString()));
    } else {
      setError('');
    }

    setIsDialogOpen(true);
  };

  const handleSubmitBid = () => {
    const effectiveStartingAmount = startingAmount || DEFAULT_STARTING_AMOUNT;

    // Different validation based on whether this is first bid or not
    if (currentBid === null) {
      // First bid - must be at least the starting amount AND in 250k increments
      if (bidAmount < effectiveStartingAmount) {
        setError(
          `First bid must be at least $${effectiveStartingAmount.toLocaleString()} (the contract amount)`
        );
        return;
      }

      // Validate that bid is in 250k increments
      if (bidAmount % BID_INCREMENT !== 0) {
        setError(
          `Bids must be in increments of $${BID_INCREMENT.toLocaleString()} (e.g. $750k, $1M, $1.25M)`
        );
        return;
      }
    } else {
      // Subsequent bid - must be at least current + 250k
      if (bidAmount < currentBid + BID_INCREMENT) {
        setError(
          `Bid must be at least $${(currentBid + BID_INCREMENT).toLocaleString()} (current + $250,000)`
        );
        return;
      }

      // Validate that bid is in 250k increments
      if (bidAmount % BID_INCREMENT !== 0) {
        setError(
          `Bids must be in increments of $${BID_INCREMENT.toLocaleString()} (e.g. $750k, $1M, $1.25M)`
        );
        return;
      }
    }

    // If we have team data, validate against salary cap
    if (teamData) {
      const { salaryCap, currentSalary, totalCommitted, activeBids } = teamData;

      // Check if player already has an active bid from this team
      const existingBid = activeBids.find((bid) => bid.playerSeasonId === playerId);
      const existingBidAmount = existingBid ? existingBid.amount : 0;

      // Calculate the total impact on the salary cap
      const totalCurrentCommitments = currentSalary + totalCommitted;
      const adjustedProposedTotal = totalCurrentCommitments - existingBidAmount + bidAmount;

      // Check if this bid would exceed the salary cap
      if (adjustedProposedTotal > salaryCap) {
        setError(`This bid would exceed your salary cap of $${salaryCap.toLocaleString()}`);
        return;
      }

      // Calculate minimum required budget for remaining roster needs
      const remainingCap = salaryCap - adjustedProposedTotal;
      const minRosterCost =
        MIN_FORWARDS * MIN_SALARY + MIN_DEFENSE * MIN_SALARY + MIN_GOALIES * MIN_SALARY;

      if (remainingCap < minRosterCost) {
        setError(
          `This bid would not leave enough cap space ($${remainingCap.toLocaleString()}) for a minimum roster ($${minRosterCost.toLocaleString()})`
        );
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

  const validateBidAmount = (value: string) => {
    const numValue = Number(value);
    const effectiveStartingAmount = startingAmount || DEFAULT_STARTING_AMOUNT;
    let errorMessage = '';

    // Basic input validation
    if (value === '' || isNaN(numValue)) {
      return 'Please enter a valid number';
    }

    // Increment validation
    if (numValue % BID_INCREMENT !== 0) {
      return `Bids must be in increments of $${BID_INCREMENT.toLocaleString()}`;
    }

    // First bid or subsequent bid validation
    if (currentBid === null) {
      if (numValue < effectiveStartingAmount) {
        return `First bid must be at least $${effectiveStartingAmount.toLocaleString()}`;
      }
    } else {
      if (numValue < currentBid + BID_INCREMENT) {
        return `Bid must be at least $${(currentBid + BID_INCREMENT).toLocaleString()}`;
      }
    }

    // Salary cap validation
    if (teamData) {
      const { salaryCap, currentSalary, totalCommitted, activeBids } = teamData;

      // Check if player already has an active bid from this team
      const existingBid = activeBids.find((bid) => bid.playerSeasonId === playerId);
      const existingBidAmount = existingBid ? existingBid.amount : 0;

      // Calculate the total impact on the salary cap
      const totalCurrentCommitments = currentSalary + totalCommitted;
      const adjustedProposedTotal = totalCurrentCommitments - existingBidAmount + numValue;

      // Check if this bid would exceed the salary cap
      if (adjustedProposedTotal > salaryCap) {
        return `This bid would exceed your salary cap of $${salaryCap.toLocaleString()}`;
      }

      // Calculate minimum required budget for remaining roster needs
      const remainingCap = salaryCap - adjustedProposedTotal;
      const minRosterCost =
        MIN_FORWARDS * MIN_SALARY + MIN_DEFENSE * MIN_SALARY + MIN_GOALIES * MIN_SALARY;

      if (remainingCap < minRosterCost) {
        return `This bid would not leave enough cap space for a minimum roster`;
      }
    }

    return '';
  };

  return (
    <>
      <Button
        className={`transition-all duration-300 ${isCompact ? 'px-4' : 'w-full'} ${
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

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          // Prevent closing dialog during submission
          if (localIsSubmitting && !open) return;
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Place a Bid</DialogTitle>
            <DialogDescription>
              {currentBid === null
                ? `Enter your bid amount below. First bid must be at least $${(startingAmount || DEFAULT_STARTING_AMOUNT).toLocaleString()} (the contract amount) in $250,000 increments.`
                : `Enter your bid amount below. The minimum bid is $${(currentBid + BID_INCREMENT).toLocaleString()}.
                Bids must be in $250,000 increments (e.g. $750k, $1M, $1.25M).`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bidAmount">Bid Amount</Label>
              <Input
                id="bidAmount"
                type="text"
                value={rawInputValue}
                onChange={(e) => {
                  // Store the raw input value
                  setRawInputValue(e.target.value);

                  // If it's a valid number, update the bidAmount state
                  if (e.target.value !== '' && !isNaN(Number(e.target.value))) {
                    const numValue = Number(e.target.value);
                    setBidAmount(numValue);
                    setError(validateBidAmount(e.target.value));
                  } else {
                    // If it's empty or invalid, set bidAmount to 0 for validation purposes
                    // but don't force the display to show 0
                    setBidAmount(0);
                    setError('Please enter a valid number');
                  }
                }}
                onClick={(e) => {
                  // Select all text when clicked for easier editing
                  (e.target as HTMLInputElement).select();
                }}
                className="bg-gray-800 border-gray-700"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={localIsSubmitting}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex justify-between text-sm">
              <span>{currentBid === null ? 'Starting Amount:' : 'Current Bid:'}</span>
              <span>
                $
                {currentBid === null
                  ? startingAmount
                    ? startingAmount.toLocaleString()
                    : DEFAULT_STARTING_AMOUNT.toLocaleString()
                  : currentBid.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Your Bid:</span>
              <span>${bidAmount.toLocaleString()}</span>
            </div>

            {/* Show percentage increase for all bids */}
            <div className="flex justify-between text-sm">
              <span>Increase:</span>
              <span
                className={
                  bidAmount >= (currentBid === null ? startingAmount : currentBid + BID_INCREMENT)
                    ? 'text-green-500'
                    : 'text-red-500'
                }
              >
                {bidAmount >= (currentBid === null ? startingAmount : currentBid + BID_INCREMENT)
                  ? `$${(bidAmount - (currentBid === null ? startingAmount : currentBid)).toLocaleString()} (+${Math.round(((bidAmount - (currentBid === null ? startingAmount : currentBid)) / (currentBid === null ? startingAmount : currentBid)) * 100)}%)`
                  : 'Invalid bid amount'}
              </span>
            </div>

            <div className="text-sm text-gray-400 bg-gray-800/50 p-2 rounded border border-gray-700">
              <p className="font-medium mb-1">Bidding Rules:</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>First bid must be at least the contract amount (usually $500,000)</li>
                <li>All bids must use $250,000 increments (e.g. $500k, $750k, $1M, $1.25M)</li>
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
              disabled={
                error !== '' || // Disable if there are any validation errors
                (currentBid === null
                  ? bidAmount < (startingAmount || DEFAULT_STARTING_AMOUNT) ||
                    bidAmount % BID_INCREMENT !== 0
                  : bidAmount < currentBid + BID_INCREMENT || bidAmount % BID_INCREMENT !== 0) ||
                localIsSubmitting
              }
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
