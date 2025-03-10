'use client';

import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackToTop } from '@/components/back-to-top';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationType } from '@prisma/client';
import { BiddingHeader } from './components/bidding-header';
import { PlayersTab } from './components/tabs/players-tab';
import { TeamSalariesTab } from './components/tabs/team-salaries-tab';
import { ManagerDashboardTab } from './components/tabs/manager-dashboard-tab';
import { useBiddingData } from './hooks/use-bidding-data';
import {
  League,
  Team,
  Player
} from './types';

// interface League {
//   id: string;
//   name: string;
//   logo: string;
//   bannerColor: string;
// }

// interface TeamManager {
//   userId: string;
//   name: string;
//   role: any;
// }

// interface Team {
//   id: string;
//   name: string;
//   identifier: string;
//   managers: TeamManager[];
//   stats: {
//     wins: number;
//     losses: number;
//     otLosses: number;
//   };
//   roster: {
//     forwards: number;
//     defense: number;
//     goalies: number;
//   };
//   salary: {
//     current: number;
//     cap: number;
//   };
// }

// interface Bid {
//   teamId: string;
//   teamName: string;
//   amount: number;
//   timestamp: number;
// }

// interface Player {
//   id: string;
//   name: string;
//   position: string;
//   gamertag: string;
//   currentBid: number | null;
//   currentTeamId: string | null;
//   currentTeamName: string | null;
//   bids: Bid[];
//   endTime?: number;
//   contract: {
//     amount: number;
//   };
//   stats: {
//     gamesPlayed: number;
//     goals: number;
//     assists: number;
//     plusMinus: number;
//   };
//   player: {
//     user: {
//       id: string;
//     };
//   };
// }

interface BiddingBoardProps {
  league: League;
  teams: Team[];
  availablePlayers: Player[];
}

export function BiddingBoard({
  league,
  teams,
  availablePlayers: initialPlayers,
}: BiddingBoardProps) {
  const { data: session } = useSession();
  const [managedTeam, setManagedTeam] = useState<Team | null>(null);
  const { notifications } = useNotifications();
  const [refreshInterval, setRefreshInterval] = useState<number>(10000); // 10 seconds

  // State for filters
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [bidStatusFilter, setBidStatusFilter] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailedView, setIsDetailedView] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Use the custom hook for bidding data
  const {
    availablePlayers,
    biddingStatus,
    teamData,
    isLoading,
    isSubmitting,
    isRefreshPaused,
    fetchBiddingData,
    handlePlaceBid,
    setIsRefreshPaused,
    setAvailablePlayers,
  } = useBiddingData(league.id, managedTeam);

  // Determine if the current user is a team manager
  useEffect(() => {
    if (session?.user?.id && teams) {
      // Find a team the user manages
      const team = teams.find((team) =>
        team.managers.some((manager) => manager.userId === session.user?.id)
      );
      setManagedTeam(team || null);
    }
  }, [session, teams]);

  // Initial data fetch
  useEffect(() => {
    fetchBiddingData();
  }, [league.id, managedTeam]);

  // Pause refreshing when user is interacting with bid forms
  useEffect(() => {
    if (isSubmitting) {
      setIsRefreshPaused(true);
    } else {
      // Resume refreshing after a short delay to let animations complete
      const timer = setTimeout(() => {
        setIsRefreshPaused(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSubmitting, setIsRefreshPaused]);

  // Background refresh on interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isRefreshPaused) {
        fetchBiddingData(true);
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, league.id, managedTeam, isRefreshPaused, fetchBiddingData]);

  // Filtered and sorted players
  const filteredPlayers = useMemo(() => {
    return availablePlayers
      .filter((player) => {
        // Position filter
        if (positionFilter.length > 0 && !positionFilter.includes(player.position)) {
          return false;
        }

        // Bid status filter
        if (bidStatusFilter === 'open' && player.currentBid !== null) return false;
        if (bidStatusFilter === 'no-bids' && player.currentTeamId !== null) return false;

        // Search query
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return (
            player.name.toLowerCase().includes(searchLower) ||
            player.gamertag.toLowerCase().includes(searchLower) ||
            player.position.toLowerCase().includes(searchLower)
          );
        }

        return true;
      })
      .sort((a, b) => {
        // First sort by endTime (ascending) to show expiring soon first
        const aEndTime = a.endTime || Number.MAX_SAFE_INTEGER;
        const bEndTime = b.endTime || Number.MAX_SAFE_INTEGER;

        if (aEndTime !== bEndTime) {
          return aEndTime - bEndTime;
        }

        // Then sort by price if requested
        if (priceSort === 'asc') {
          return a.contract.amount - b.contract.amount;
        }
        if (priceSort === 'desc') {
          return b.contract.amount - a.contract.amount;
        }
        return 0;
      });
  }, [availablePlayers, positionFilter, bidStatusFilter, searchQuery, priceSort]);

  // Determine if user can bid
  const canBid = Boolean(managedTeam && biddingStatus?.active);

  // Effect to scroll to a specific player when they receive an outbid notification
  useEffect(() => {
    // Find recent outbid notifications
    const outbidNotifications = notifications.filter(
      (n) => 
        n.type === NotificationType.TEAM && 
        n.title === 'You have been outbid!' &&
        n.metadata?.playerName
    );
    
    if (outbidNotifications.length === 0) return;
    
    // Get the most recent notification
    const latestNotification = outbidNotifications.reduce((latest, current) => {
      const latestDate = new Date(latest.createdAt);
      const currentDate = new Date(current.createdAt);
      return currentDate > latestDate ? current : latest;
    }, outbidNotifications[0]);
    
    // Check if this is a recent notification (last 10 seconds)
    const notificationTime = new Date(latestNotification.createdAt).getTime();
    const now = Date.now();
    const isRecent = now - notificationTime < 10000; // 10 seconds
    
    if (!isRecent) return;
    
    // Find the player in the available players list
    const playerName = latestNotification.metadata?.playerName;
    const player = availablePlayers.find(p => p.name === playerName);
    
    if (player) {
      // Get the previous and current bid amounts
      const previousBid = latestNotification.metadata?.previousBid;
      const newBid = latestNotification.metadata?.newBid;
      
      // Format the message with bid information but without revealing the competing team
      let toastMessage = `You've been outbid on ${playerName}!`;
      if (previousBid && newBid) {
        toastMessage = `You've been outbid on ${playerName}! New bid: $${Number(newBid).toLocaleString()}`;
      }
      
      // Highlight this player temporarily with a toast and scroll to them
      toast.info(toastMessage, {
        action: {
          label: 'View Player',
          onClick: () => {
            // Find the player element and scroll to it
            const playerElement = document.getElementById(`player-${player.id}`);
            if (playerElement) {
              playerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Add a highlight effect
              playerElement.classList.add('flash-highlight');
              setTimeout(() => {
                playerElement.classList.remove('flash-highlight');
              }, 2000);
            }
          }
        }
      });
    }
  }, [notifications, availablePlayers]);

  return (
    <div className="min-h-screen">
      {/* League Banner */}
      <div className={`w-full ${league.bannerColor} py-8`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Image
              src={league.logo}
              alt={`${league.name} Logo`}
              width={80}
              height={80}
              className="object-contain"
            />
            <h1 className="text-4xl font-bold text-white">{league.name}</h1>
          </div>
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* Bidding status header */}
      <BiddingHeader 
        biddingStatus={biddingStatus} 
        onTimerEnd={() => fetchBiddingData()} 
      />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="players">
          <TabsList className="mb-4">
            <TabsTrigger value="players">Bidding Board</TabsTrigger>
            {/* Team Salaries visible to everyone */}
            <TabsTrigger value="team-salaries">Team Salaries</TabsTrigger>
            {/* Team Manager Dashboard only for team managers */}
            {managedTeam && <TabsTrigger value="manager-dashboard">Manager Dashboard</TabsTrigger>}
          </TabsList>

          <TabsContent value="players">
            <PlayersTab
              players={availablePlayers}
              filteredPlayers={filteredPlayers}
              isDetailedView={isDetailedView}
              positionFilter={positionFilter}
              bidStatusFilter={bidStatusFilter}
              priceSort={priceSort}
              searchQuery={searchQuery}
              isFiltersOpen={isFiltersOpen}
              canBid={canBid}
              isSubmitting={isSubmitting}
              isLoading={isLoading}
              managedTeamId={managedTeam?.id || null}
              teamData={teamData}
              onPlaceBid={handlePlaceBid}
              setPositionFilter={setPositionFilter}
              setBidStatusFilter={setBidStatusFilter}
              setPriceSort={setPriceSort}
              setSearchQuery={setSearchQuery}
              setIsDetailedView={setIsDetailedView}
              setIsFiltersOpen={setIsFiltersOpen}
            />
          </TabsContent>

          {/* Team Salaries tab - available to all users */}
          <TabsContent value="team-salaries">
            <TeamSalariesTab teams={teams} leagueId={league.id} />
          </TabsContent>

          {/* Team Manager Dashboard - only for team managers */}
          {managedTeam && (
            <TabsContent value="manager-dashboard">
              <ManagerDashboardTab 
                team={managedTeam} 
                teamData={teamData}
                availablePlayers={availablePlayers}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <BackToTop />
    </div>
  );
}