'use client';

import { Nav } from '@/components/nav';
import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamManagementRole } from '@prisma/client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filters } from './components/filters';
import { PlayerList } from './components/player-list';
import { TeamSalaryCard } from './components/team-salary-card';
import { BackToTop } from '@/components/back-to-top';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";

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

interface Player {
  id: string;
  name: string;
  position: string;
  gamertag: string;
  currentBid: number | null;
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

export function BiddingBoard({ league, teams, availablePlayers }: BiddingBoardProps) {
  // State for filters
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [bidStatusFilter, setBidStatusFilter] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailedView, setIsDetailedView] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Handle scroll events for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered and sorted players
  const filteredPlayers = useMemo(() => {
    return availablePlayers
      .filter(player => {
        // Position filter
        if (positionFilter !== 'all') {
          // Group filters
          if (positionFilter === 'forward' && !['C', 'LW', 'RW'].includes(player.position)) return false;
          if (positionFilter === 'defense' && !['LD', 'RD'].includes(player.position)) return false;
          // Specific position filters
          if (['C', 'LW', 'RW', 'LD', 'RD', 'G'].includes(positionFilter) && player.position !== positionFilter) return false;
        }

        // Bid status filter
        if (bidStatusFilter === 'open' && player.currentBid !== null) return false;
        if (bidStatusFilter === 'no-bids' && player.currentBid !== null) return false;

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
        if (priceSort === 'asc') {
          return a.contract.amount - b.contract.amount;
        }
        if (priceSort === 'desc') {
          return b.contract.amount - a.contract.amount;
        }
        return 0;
      });
  }, [availablePlayers, positionFilter, bidStatusFilter, searchQuery, priceSort]);

  const handlePlaceBid = (playerId: string) => {
    // TODO: Implement bidding functionality
    console.log('Place bid for player:', playerId);
  };

  return (
    <div className="min-h-screen relative">
      <Nav />
      <div className={`${league.bannerColor} py-8`}>
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Image src={league.logo} alt={league.name} width={64} height={64} />
          <h1 className="text-4xl font-bold text-white">{league.name}</h1>
        </div>
      </div>
      <LeagueNav leagueId={league.id} />
      
      <div className="container mx-auto px-6 sm:px-8 py-10">
        <Tabs defaultValue="bidding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-black/60 backdrop-blur-sm border-b border-white/10">
            <TabsTrigger value="bidding">Bidding Board</TabsTrigger>
            <TabsTrigger value="teams">Team Salaries</TabsTrigger>
          </TabsList>

          <TabsContent value="bidding" className="space-y-6">
            <Filters
              positionFilter={positionFilter}
              setPositionFilter={setPositionFilter}
              bidStatusFilter={bidStatusFilter}
              setBidStatusFilter={setBidStatusFilter}
              priceSort={priceSort}
              setPriceSort={setPriceSort}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalPlayers={availablePlayers.length}
              filteredCount={filteredPlayers.length}
              isDetailedView={isDetailedView}
              setIsDetailedView={setIsDetailedView}
              isOpen={isFiltersOpen}
              setIsOpen={setIsFiltersOpen}
            />

            {/* Bid Board */}
            <div className="card-gradient rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Available Players</h2>
              <Suspense fallback={<PlayerListSkeleton />}>
                <PlayerList 
                  players={filteredPlayers}
                  isDetailedView={isDetailedView}
                  onPlaceBid={handlePlaceBid}
                />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            {/* Team Salary Cap Status */}
            <div className="card-gradient rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Team Salary Cap Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {teams.map(team => (
                  <TeamSalaryCard key={team.id} team={team} leagueId={league.id} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <BackToTop />
      </div>
    </div>
  );
} 