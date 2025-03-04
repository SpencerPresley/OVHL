'use client';

import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import { TeamManagementRole } from '@prisma/client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filters } from './components/filters';
import { PlayerList } from './components/player-list';
import { TeamSalaryCard } from './components/team-salary-card';
import { BackToTop } from '@/components/back-to-top';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { CountdownTimer } from './components/countdown-timer';
import { Badge } from '@/components/ui/badge';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface TeamManager {
  userId: string;
  name: string;
  role: TeamManagementRole;
}

interface Team {
  id: string;
  name: string;
  identifier: string;
  managers: TeamManager[];
  stats: {
    wins: number;
    losses: number;
    otLosses: number;
  };
  roster: {
    forwards: number;
    defense: number;
    goalies: number;
  };
  salary: {
    current: number;
    cap: number;
  };
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

interface BiddingStatus {
  active: boolean;
  startTime: number;
  endTime: number;
  leagueId: string;
  tierLevel: number;
  lastUpdate: number;
}

interface BiddingBoardProps {
  league: League;
  teams: Team[];
  availablePlayers: Player[];
}

function PlayerListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-[200px] w-full" />
      ))}
    </div>
  );
}

/**
 * Counts the number of players in specified positions
 * @param roster - The team roster
 * @param positions - Array of positions to count
 * @returns The number of players in the specified positions
 */
function getPositionCount(roster: any[], positions: string[]): number {
  return roster.filter(player => positions.includes(player.position)).length;
}

/**
 * Filters and returns players in a specific position
 * @param roster - The team roster
 * @param position - The position to filter by
 * @returns Array of players in the specified position
 */
function getPositionPlayers(roster: any[], position: string): any[] {
  return roster.filter(player => player.position === position);
}

export function BiddingBoard({ league, teams, availablePlayers: initialPlayers }: BiddingBoardProps) {
  const { data: session } = useSession();
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>(initialPlayers);
  const [biddingStatus, setBiddingStatus] = useState<BiddingStatus | null>(null);
  const [teamData, setTeamData] = useState<TeamBidding | null>(null);
  const [tierId, setTierId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingInBackground, setIsFetchingInBackground] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());
  const [isRefreshPaused, setIsRefreshPaused] = useState(false);
  
  // State for filters
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [bidStatusFilter, setBidStatusFilter] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailedView, setIsDetailedView] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [managedTeam, setManagedTeam] = useState<Team | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(10000); // 10 seconds

  // Determine if the current user is a team manager
  useEffect(() => {
    if (session?.user?.id && teams) {
      // Find a team the user manages
      const team = teams.find(team => 
        team.managers.some(manager => manager.userId === session.user?.id)
      );
      setManagedTeam(team || null);
    }
  }, [session, teams]);

  // Fetch the latest bidding data
  const fetchBiddingData = async (inBackground = false) => {
    try {
      if (!inBackground) {
        setIsLoading(true);
      } else {
        setIsFetchingInBackground(true);
      }

      const params = new URLSearchParams();
      params.append('leagueId', league.id);
      
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
  }, [isSubmitting]);
  
  // Background refresh on interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isRefreshPaused && !isFetchingInBackground) {
        fetchBiddingData(true);
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, league.id, managedTeam, isRefreshPaused, isFetchingInBackground]);

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
          leagueId: league.id,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place bid');
      }
      
      const result = await response.json();
      
      // Update the player in the local state
      setAvailablePlayers(players => 
        players.map(player => 
          player.id === playerId ? result.bidding : player
        )
      );
      
      toast.success('Bid placed successfully!');
      
      // Fetch updated team data after bid placement
      fetchBiddingData(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Calculate salary cap statistics for the managed team
  const teamSalaryStats = useMemo(() => {
    if (!teamData) return null;
    
    const { salaryCap, currentSalary, totalCommitted } = teamData;
    const available = salaryCap - currentSalary;
    const uncommitted = available - totalCommitted;
    
    const percentages = {
      current: (currentSalary / salaryCap) * 100,
      committed: (totalCommitted / salaryCap) * 100,
      available: (uncommitted / salaryCap) * 100,
    };
    
    return {
      currentSalary,
      totalCommitted,
      available,
      uncommitted,
      salaryCap,
      percentages,
    };
  }, [teamData]);

  // Determine if user can bid
  const canBid = Boolean(managedTeam && biddingStatus?.active);

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
      <div className="bg-gray-900/60 border-y border-gray-800">
        <div className="container mx-auto px-4 py-2 flex flex-col md:flex-row justify-between items-center">
          <div>
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  biddingStatus?.active ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-lg font-medium">
                Bidding {biddingStatus?.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {biddingStatus?.active && biddingStatus.lastUpdate && (
              <p className="text-sm text-gray-400">
                Updated {new Date(biddingStatus.lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </div>
          {biddingStatus?.active && biddingStatus.endTime && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Ends in:</p>
              <span className="text-xl font-mono">
                <CountdownTimer endTime={biddingStatus.endTime} onEnd={() => fetchBiddingData()} />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="players">
          <TabsList className="mb-4">
            <TabsTrigger value="players">Bidding Board</TabsTrigger>
            {/* Team Salaries visible to everyone */}
            <TabsTrigger value="team-salaries">Team Salaries</TabsTrigger>
            {/* Team Manager Dashboard only for team managers */}
            {managedTeam && (
              <TabsTrigger value="manager-dashboard">Manager Dashboard</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Filters
                setPositionFilter={setPositionFilter}
                setBidStatusFilter={setBidStatusFilter}
                setPriceSort={setPriceSort}
                setSearchQuery={setSearchQuery}
                setIsDetailedView={setIsDetailedView}
                positionFilter={positionFilter}
                bidStatusFilter={bidStatusFilter}
                priceSort={priceSort}
                searchQuery={searchQuery}
                isDetailedView={isDetailedView}
                isFiltersOpen={isFiltersOpen}
                setIsFiltersOpen={setIsFiltersOpen}
                totalPlayers={availablePlayers.length}
                filteredCount={filteredPlayers.length}
              />

              <Suspense fallback={<PlayerListSkeleton />}>
                {isLoading ? (
                  <PlayerListSkeleton />
                ) : (
                  <PlayerList
                    players={filteredPlayers}
                    isDetailedView={isDetailedView}
                    onPlaceBid={handlePlaceBid}
                    canBid={!!managedTeam && biddingStatus?.active === true}
                    isSubmitting={isSubmitting}
                    managedTeamId={managedTeam?.id || null}
                  />
                )}
              </Suspense>
            </div>
          </TabsContent>

          {/* Team Salaries tab - available to all users */}
          <TabsContent value="team-salaries" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teams.map((team) => (
                <TeamSalaryCard key={team.id} team={team} leagueId={league.id} />
              ))}
            </div>
          </TabsContent>

          {/* Team Manager Dashboard - only for team managers */}
          {managedTeam && (
            <TabsContent value="manager-dashboard" className="space-y-6">
              <div className="card-gradient rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{managedTeam.name} Dashboard</h2>
                
                {/* Team Management Section */}
                <div className="mb-6 border-b border-gray-700 pb-6">
                  <h3 className="text-lg font-medium mb-3">Team Management</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {['OWNER', 'GM', 'AGM', 'PAGM'].map((roleStr) => {
                      const role = roleStr as TeamManagementRole;
                      const manager = managedTeam.managers.find(m => m.role === role);
                      const isHigherRole = ['OWNER', 'GM', 'AGM'].includes(roleStr);
                      
                      return (
                        <div 
                          key={roleStr} 
                          className={`bg-gray-800/40 rounded-lg p-3 border ${isHigherRole ? 'border-gray-600/50' : 'border-gray-700/30'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-400">{roleStr}</span>
                          </div>
                          {manager ? (
                            <span className="font-medium text-sm">
                              {manager.name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">Vacant</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Team Salary Overview */}
                <TeamSalaryCard
                  teamName={managedTeam.name}
                  salaryCap={teamData?.salaryCap || 0}
                  currentSpent={teamData?.currentSalary || 0}
                  committed={teamData?.totalCommitted || 0}
                  availableCap={(teamData?.salaryCap || 0) - (teamData?.currentSalary || 0) - (teamData?.totalCommitted || 0)}
                />
                
                {/* Active Bids Section */}
                {teamData?.activeBids && teamData.activeBids.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Active Bids</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teamData.activeBids.map((bid) => (
                        <div key={bid.playerSeasonId} className="bg-gray-900/50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{bid.playerName}</div>
                              <div className="text-sm text-gray-400">{bid.position}</div>
                            </div>
                            <Badge variant="outline" className="bg-blue-900/50 text-blue-400 border-blue-400/30">
                              ${bid.amount.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            Ends in: <CountdownTimer endTime={bid.endTime} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Current Roster Section */}
                {teamData?.roster && teamData.roster.length > 0 && (
                  <div className="mt-8 card-gradient rounded-lg overflow-hidden">
                    <div className="bg-gray-900/80 p-4 border-b border-gray-800">
                      <h3 className="text-lg font-semibold">Current Roster</h3>
                    </div>
                    
                    {/* Position-based roster organization */}
                    <div className="p-4">
                      {/* Forwards Section */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-800">
                          <h4 className="font-semibold">Forwards</h4>
                          <span className={`text-sm font-medium ${getPositionCount(teamData.roster, ['LW', 'C', 'RW']) >= 9 ? 'text-green-500' : getPositionCount(teamData.roster, ['LW', 'C', 'RW']) >= 6 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {getPositionCount(teamData.roster, ['LW', 'C', 'RW'])} players
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Left Wing */}
                          <div className="bg-gray-800/40 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-700/50">
                              <h5 className="text-sm font-medium text-blue-300">Left Wing</h5>
                              <span className="text-xs">{getPositionCount(teamData.roster, ['LW'])}</span>
                            </div>
                            
                            <div className="space-y-2">
                              {getPositionPlayers(teamData.roster, 'LW').map((player) => {
                                // Check if player has an active bid from any team
                                const activePlayerBid = availablePlayers.find(p => p.gamertag === player.gamertag && p.currentBid !== null);
                                const hasActiveBid = !!activePlayerBid;
                                // Check if this team has a bid on the player
                                const hasTeamBid = hasActiveBid && activePlayerBid?.currentTeamId === managedTeam.id;
                                
                                return (
                                  <div key={player.id} className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm flex items-center">
                                        {player.gamertag}
                                        {hasActiveBid && (
                                          <Badge 
                                            variant="outline" 
                                            className={`ml-2 text-xs py-0 h-4 ${hasTeamBid ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}
                                          >
                                            {hasTeamBid ? 'Your Bid' : 'Has Bid'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs font-mono text-gray-400">
                                      ${player.contractAmount.toLocaleString()}
                                    </div>
                                  </div>
                                );
                              })}
                              {getPositionCount(teamData.roster, ['LW']) === 0 && (
                                <div className="text-xs text-gray-500 italic">No players</div>
                              )}
                            </div>
                          </div>
                          
                          {/* Center */}
                          <div className="bg-gray-800/40 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-700/50">
                              <h5 className="text-sm font-medium text-red-300">Center</h5>
                              <span className="text-xs">{getPositionCount(teamData.roster, ['C'])}</span>
                            </div>
                            
                            <div className="space-y-2">
                              {getPositionPlayers(teamData.roster, 'C').map((player) => {
                                // Check if player has an active bid from any team
                                const activePlayerBid = availablePlayers.find(p => p.gamertag === player.gamertag && p.currentBid !== null);
                                const hasActiveBid = !!activePlayerBid;
                                // Check if this team has a bid on the player
                                const hasTeamBid = hasActiveBid && activePlayerBid?.currentTeamId === managedTeam.id;
                                
                                return (
                                  <div key={player.id} className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm flex items-center">
                                        {player.gamertag}
                                        {hasActiveBid && (
                                          <Badge 
                                            variant="outline" 
                                            className={`ml-2 text-xs py-0 h-4 ${hasTeamBid ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}
                                          >
                                            {hasTeamBid ? 'Your Bid' : 'Has Bid'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs font-mono text-gray-400">
                                      ${player.contractAmount.toLocaleString()}
                                    </div>
                                  </div>
                                );
                              })}
                              {getPositionCount(teamData.roster, ['C']) === 0 && (
                                <div className="text-xs text-gray-500 italic">No players</div>
                              )}
                            </div>
                          </div>
                          
                          {/* Right Wing */}
                          <div className="bg-gray-800/40 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-700/50">
                              <h5 className="text-sm font-medium text-green-300">Right Wing</h5>
                              <span className="text-xs">{getPositionCount(teamData.roster, ['RW'])}</span>
                            </div>
                            
                            <div className="space-y-2">
                              {getPositionPlayers(teamData.roster, 'RW').map((player) => {
                                // Check if player has an active bid from any team
                                const activePlayerBid = availablePlayers.find(p => p.gamertag === player.gamertag && p.currentBid !== null);
                                const hasActiveBid = !!activePlayerBid;
                                // Check if this team has a bid on the player
                                const hasTeamBid = hasActiveBid && activePlayerBid?.currentTeamId === managedTeam.id;
                                
                                return (
                                  <div key={player.id} className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm flex items-center">
                                        {player.gamertag}
                                        {hasActiveBid && (
                                          <Badge 
                                            variant="outline" 
                                            className={`ml-2 text-xs py-0 h-4 ${hasTeamBid ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}
                                          >
                                            {hasTeamBid ? 'Your Bid' : 'Has Bid'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs font-mono text-gray-400">
                                      ${player.contractAmount.toLocaleString()}
                                    </div>
                                  </div>
                                );
                              })}
                              {getPositionCount(teamData.roster, ['RW']) === 0 && (
                                <div className="text-xs text-gray-500 italic">No players</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Defense Section */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-800">
                          <h4 className="font-semibold">Defense</h4>
                          <span className={`text-sm font-medium ${getPositionCount(teamData.roster, ['LD', 'RD']) >= 6 ? 'text-green-500' : getPositionCount(teamData.roster, ['LD', 'RD']) >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {getPositionCount(teamData.roster, ['LD', 'RD'])} players
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Left Defense */}
                          <div className="bg-gray-800/40 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-700/50">
                              <h5 className="text-sm font-medium text-teal-300">Left Defense</h5>
                              <span className="text-xs">{getPositionCount(teamData.roster, ['LD'])}</span>
                            </div>
                            
                            <div className="space-y-2">
                              {getPositionPlayers(teamData.roster, 'LD').map((player) => {
                                // Check if player has an active bid from any team
                                const activePlayerBid = availablePlayers.find(p => p.gamertag === player.gamertag && p.currentBid !== null);
                                const hasActiveBid = !!activePlayerBid;
                                // Check if this team has a bid on the player
                                const hasTeamBid = hasActiveBid && activePlayerBid?.currentTeamId === managedTeam.id;
                                
                                return (
                                  <div key={player.id} className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm flex items-center">
                                        {player.gamertag}
                                        {hasActiveBid && (
                                          <Badge 
                                            variant="outline" 
                                            className={`ml-2 text-xs py-0 h-4 ${hasTeamBid ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}
                                          >
                                            {hasTeamBid ? 'Your Bid' : 'Has Bid'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs font-mono text-gray-400">
                                      ${player.contractAmount.toLocaleString()}
                                    </div>
                                  </div>
                                );
                              })}
                              {getPositionCount(teamData.roster, ['LD']) === 0 && (
                                <div className="text-xs text-gray-500 italic">No players</div>
                              )}
                            </div>
                          </div>
                          
                          {/* Right Defense */}
                          <div className="bg-gray-800/40 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-700/50">
                              <h5 className="text-sm font-medium text-yellow-300">Right Defense</h5>
                              <span className="text-xs">{getPositionCount(teamData.roster, ['RD'])}</span>
                            </div>
                            
                            <div className="space-y-2">
                              {getPositionPlayers(teamData.roster, 'RD').map((player) => {
                                // Check if player has an active bid from any team
                                const activePlayerBid = availablePlayers.find(p => p.gamertag === player.gamertag && p.currentBid !== null);
                                const hasActiveBid = !!activePlayerBid;
                                // Check if this team has a bid on the player
                                const hasTeamBid = hasActiveBid && activePlayerBid?.currentTeamId === managedTeam.id;
                                
                                return (
                                  <div key={player.id} className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm flex items-center">
                                        {player.gamertag}
                                        {hasActiveBid && (
                                          <Badge 
                                            variant="outline" 
                                            className={`ml-2 text-xs py-0 h-4 ${hasTeamBid ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}
                                          >
                                            {hasTeamBid ? 'Your Bid' : 'Has Bid'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs font-mono text-gray-400">
                                      ${player.contractAmount.toLocaleString()}
                                    </div>
                                  </div>
                                );
                              })}
                              {getPositionCount(teamData.roster, ['RD']) === 0 && (
                                <div className="text-xs text-gray-500 italic">No players</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Goalies Section */}
                      <div>
                        <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-800">
                          <h4 className="font-semibold">Goalies</h4>
                          <span className={`text-sm font-medium ${getPositionCount(teamData.roster, ['G']) >= 2 ? 'text-green-500' : getPositionCount(teamData.roster, ['G']) === 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {getPositionCount(teamData.roster, ['G'])} players
                          </span>
                        </div>
                        
                        <div>
                          <div className="bg-gray-800/40 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-700/50">
                              <h5 className="text-sm font-medium text-purple-300">Goalies</h5>
                              <span className="text-xs">{getPositionCount(teamData.roster, ['G'])}</span>
                            </div>
                            
                            <div className="space-y-2">
                              {getPositionPlayers(teamData.roster, 'G').map((player) => {
                                // Check if player has an active bid from any team
                                const activePlayerBid = availablePlayers.find(p => p.gamertag === player.gamertag && p.currentBid !== null);
                                const hasActiveBid = !!activePlayerBid;
                                // Check if this team has a bid on the player
                                const hasTeamBid = hasActiveBid && activePlayerBid?.currentTeamId === managedTeam.id;
                                
                                return (
                                  <div key={player.id} className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm flex items-center">
                                        {player.gamertag}
                                        {hasActiveBid && (
                                          <Badge 
                                            variant="outline" 
                                            className={`ml-2 text-xs py-0 h-4 ${hasTeamBid ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}
                                          >
                                            {hasTeamBid ? 'Your Bid' : 'Has Bid'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs font-mono text-gray-400">
                                      ${player.contractAmount.toLocaleString()}
                                    </div>
                                  </div>
                                );
                              })}
                              {getPositionCount(teamData.roster, ['G']) === 0 && (
                                <div className="text-xs text-gray-500 italic">No players</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <BackToTop />
    </div>
  );
}
