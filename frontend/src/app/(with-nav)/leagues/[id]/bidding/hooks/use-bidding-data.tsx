import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Team {
  id: string;
  managers: {
    userId: string;
    name: string;
    role: string;
  }[];
}

interface Bid {
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: number;
}

interface Player {
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
}

interface BiddingStatus {
  active: boolean;
  startTime: number;
  endTime: number;
  leagueId: string;
  tierLevel: number;
  lastUpdate: number;
}

interface TeamBidding {
  activeBids: {
    playerSeasonId: string;
    playerName: string;
    position: string;
    amount: number;
    endTime: number;
  }[];
  totalCommitted: number;
  roster: {
    id: string;
    name: string;
    position: string;
    gamertag: string;
    contractAmount: number;
  }[];
  salaryCap: number;
  currentSalary: number;
}

export function useBiddingData(leagueId: string, managedTeam: Team | null) {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [biddingStatus, setBiddingStatus] = useState<BiddingStatus | null>(null);
  const [teamData, setTeamData] = useState<TeamBidding | null>(null);
  const [tierId, setTierId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingInBackground, setIsFetchingInBackground] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());
  const [isRefreshPaused, setIsRefreshPaused] = useState(false);

  // Fetch the latest bidding data
  const fetchBiddingData = async (inBackground = false) => {
    try {
      if (!inBackground) {
        setIsLoading(true);
      } else {
        setIsFetchingInBackground(true);
      }

      const params = new URLSearchParams();
      params.append('leagueId', leagueId);

      // Include team data if user manages a team
      if (managedTeam) {
        params.append('teamId', managedTeam.id);
      }

      const response = await fetch(`/api/bidding?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch bidding data');
      }

      const data = await response.json();

      // Only update state if we're not in the middle of submitting a bid
      if (!isSubmitting) {
        setAvailablePlayers(data.biddingPlayers || []);
        setBiddingStatus(data.biddingStatus);
        setTeamData(data.teamData);
        setTierId(data.tierId);
      }

      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('Error fetching bidding data:', error);
      if (!inBackground) {
        toast.error('Failed to load bidding data. Please try again.');
      }
    } finally {
      if (!inBackground) {
        setIsLoading(false);
      } else {
        setIsFetchingInBackground(false);
      }
    }
  };

  // Place a bid on a player
  const handlePlaceBid = async (playerId: string, amount: number) => {
    if (!managedTeam) {
      toast.error('You must be a team manager to place bids');
      return;
    }

    if (!biddingStatus?.active) {
      toast.error('Bidding is not currently active for this league');
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      // Pause background refreshes while submitting
      setIsRefreshPaused(true);

      const response = await fetch('/api/bidding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerSeasonId: playerId,
          teamId: managedTeam.id,
          amount,
          leagueId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place bid');
      }

      const result = await response.json();

      // Update the player in the local state
      setAvailablePlayers((players) =>
        players.map((player) => (player.id === playerId ? result.bidding : player))
      );

      toast.success('Bid placed successfully!');

      // Fetch updated team data after bid placement
      fetchBiddingData(true);
    } catch (error: any) {
      // Enhanced error messaging with appropriate styling
      const errorMessage = error.message || 'Failed to place bid';

      // Check if the error is related to salary cap or roster requirements
      const isSalaryError =
        errorMessage.includes('salary cap') ||
        errorMessage.includes('cap space') ||
        errorMessage.includes('roster');

      // Use a different toast style for salary/roster errors to make them more noticeable
      if (isSalaryError) {
        toast.error(errorMessage, {
          duration: 6000, // Show longer for complex messages
          style: {
            borderLeft: '4px solid #f43f5e',
            background: '#1e1e1e',
            color: '#ffffff',
          },
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    availablePlayers,
    biddingStatus,
    teamData,
    tierId,
    isLoading,
    isSubmitting,
    isFetchingInBackground,
    lastFetchTime,
    isRefreshPaused,
    fetchBiddingData,
    handlePlaceBid,
    setIsRefreshPaused,
    setAvailablePlayers,
  };
}
