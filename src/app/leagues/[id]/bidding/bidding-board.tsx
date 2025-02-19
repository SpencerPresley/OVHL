'use client';

import { Nav } from '@/components/nav';
import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamManagementRole } from '@prisma/client';
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

interface BiddingBoardProps {
  league: League;
  teams: Team[];
  availablePlayers: Player[];
}

export function BiddingBoard({ league, teams, availablePlayers }: BiddingBoardProps) {
  // State for filters
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [bidStatusFilter, setBidStatusFilter] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered and sorted players
  const filteredPlayers = useMemo(() => {
    return availablePlayers
      .filter(player => {
        // Position filter
        if (positionFilter !== 'all') {
          if (positionFilter === 'forward' && !['C', 'LW', 'RW'].includes(player.position)) return false;
          if (positionFilter === 'defense' && !['LD', 'RD'].includes(player.position)) return false;
          if (positionFilter === 'goalie' && player.position !== 'G') return false;
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

  return (
    <div className="min-h-screen">
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

          <TabsContent value="bidding" className="space-y-6 bg-black/40 p-4 sm:p-6 rounded-lg">
            {/* Filters and Search */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select
                      value={positionFilter}
                      onValueChange={setPositionFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Positions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        <SelectItem value="forward">Forwards</SelectItem>
                        <SelectItem value="defense">Defense</SelectItem>
                        <SelectItem value="goalie">Goalies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bid Status</Label>
                    <Select
                      value={bidStatusFilter}
                      onValueChange={setBidStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open for Bids</SelectItem>
                        <SelectItem value="no-bids">No Bids</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort by Price</Label>
                    <Select
                      value={priceSort || 'none'}
                      onValueChange={(value) => setPriceSort(value as 'asc' | 'desc' | null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Sort</SelectItem>
                        <SelectItem value="asc">Low to High</SelectItem>
                        <SelectItem value="desc">High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Search</Label>
                    <Input
                      type="text"
                      placeholder="Search players..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Showing {filteredPlayers.length} of {availablePlayers.length} players
              </p>
              <div className="flex gap-2">
                {positionFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {positionFilter}
                  </Badge>
                )}
                {bidStatusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {bidStatusFilter}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {searchQuery}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bid Board */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Available Players</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                    {filteredPlayers.map(player => (
                      <div key={player.id} className="group">
                        <div className="relative p-4 rounded-lg bg-black/60 backdrop-blur-sm transition-all duration-200 group-hover:bg-black/40 group-hover:scale-[1.02]">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{player.name}</h3>
                              <p className="text-sm text-muted-foreground">{player.gamertag}</p>
                            </div>
                            <Badge variant="outline" className={cn(
                              "font-semibold",
                              {
                                'bg-blue-500/20 text-blue-500 border-blue-500': player.position.includes('C'),
                                'bg-green-500/20 text-green-500 border-green-500': player.position.includes('W'),
                                'bg-yellow-500/20 text-yellow-500 border-yellow-500': player.position.includes('D'),
                                'bg-purple-500/20 text-purple-500 border-purple-500': player.position === 'G',
                              }
                            )}>
                              {player.position}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-sm text-muted-foreground">Current Bid</p>
                              <p className="font-mono font-bold">
                                {player.currentBid 
                                  ? `$${player.currentBid.toLocaleString()}` 
                                  : 'No Bids'}
                              </p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-sm text-muted-foreground">Min Contract</p>
                              <p className="font-mono font-bold">${player.contract.amount.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-center mb-4">
                            <div className="p-2 rounded-lg bg-white/5">
                              <p className="text-xs text-muted-foreground">GP</p>
                              <p className="font-medium">{player.stats.gamesPlayed}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5">
                              <p className="text-xs text-muted-foreground">G</p>
                              <p className="font-medium">{player.stats.goals}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5">
                              <p className="text-xs text-muted-foreground">A</p>
                              <p className="font-medium">{player.stats.assists}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5">
                              <p className="text-xs text-muted-foreground">+/-</p>
                              <p className={cn("font-medium", {
                                'text-green-500': player.stats.plusMinus > 0,
                                'text-red-500': player.stats.plusMinus < 0
                              })}>
                                {player.stats.plusMinus > 0 ? `+${player.stats.plusMinus}` : player.stats.plusMinus}
                              </p>
                            </div>
                          </div>

                          <Button className="w-full" variant="secondary">
                            Place Bid
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6 bg-black/40 p-4 sm:p-6 rounded-lg">
            {/* Team Salary Cap Status */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Team Salary Cap Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {teams.map(team => (
                    <div 
                      key={team.id}
                      className="group"
                    >
                      <div className="p-4 rounded-lg bg-black/60 backdrop-blur-sm transition-all duration-200 group-hover:bg-black/40 group-hover:scale-[1.02]">
                        <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Salary Cap:</span>
                            <span className="font-mono">${team.salary.cap.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current Salary:</span>
                            <span 
                              className={cn("font-mono", {
                                'text-red-500': team.salary.current > team.salary.cap,
                                'text-green-500': team.salary.current === team.salary.cap,
                                'text-white': team.salary.current < team.salary.cap
                              })}
                            >
                              ${team.salary.current.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Space:</span>
                            <span className="font-mono">
                              ${(team.salary.cap - team.salary.current).toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                            <div className="p-2 rounded-lg bg-white/5">
                              <div className="text-xs text-muted-foreground">Forwards</div>
                              <div className={cn("font-medium", {
                                'text-green-500': team.roster.forwards >= 9,
                                'text-yellow-500': team.roster.forwards >= 6,
                                'text-red-500': team.roster.forwards < 6
                              })}>
                                {team.roster.forwards}/9
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5">
                              <div className="text-xs text-muted-foreground">Defense</div>
                              <div className={cn("font-medium", {
                                'text-green-500': team.roster.defense >= 6,
                                'text-yellow-500': team.roster.defense >= 4,
                                'text-red-500': team.roster.defense < 4
                              })}>
                                {team.roster.defense}/6
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5">
                              <div className="text-xs text-muted-foreground">Goalies</div>
                              <div className={cn("font-medium", {
                                'text-green-500': team.roster.goalies >= 2,
                                'text-yellow-500': team.roster.goalies >= 1,
                                'text-red-500': team.roster.goalies < 1
                              })}>
                                {team.roster.goalies}/2
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 