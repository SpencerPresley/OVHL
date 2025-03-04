'use client';

import { LeagueNav } from '@/components/league-nav';
import { useState, useEffect } from 'react';
import { use } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TeamData {
  id: string;
  conference?: string;
  division?: string;
  league?: string;
}

const leagues: Record<string, League> = {
  nhl: {
    id: 'nhl',
    name: 'NHL',
    logo: '/nhl_logo.png',
    bannerColor: 'bg-blue-900',
  },
  ahl: {
    id: 'ahl',
    name: 'AHL',
    logo: '/ahl_logo.png',
    bannerColor: 'bg-yellow-400',
  },
  echl: {
    id: 'echl',
    name: 'ECHL',
    logo: '/echl_logo.png',
    bannerColor: 'bg-emerald-600',
  },
  chl: {
    id: 'chl',
    name: 'CHL',
    logo: '/chl_logo.png',
    bannerColor: 'bg-teal-600',
  },
};

type StatCategory = 'players' | 'teams' | 'goalies';

export default function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [category, setCategory] = useState<StatCategory>('players');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [positionFilter, setPositionFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any[]>([]);

  const league = leagues[id];

  if (!league) {
    notFound();
  }

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leagues/${id}/stats?category=${category}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [category, id]);

  const filteredStats = stats.filter((stat) => {
    console.log('Filtering stat:', {
      stat,
      divisionFilter,
      matches: {
        division: stat.division === divisionFilter,
        conference: stat.conference === divisionFilter,
        league: stat.league === divisionFilter,
      },
    });

    const searchMatch =
      searchTerm.toLowerCase().trim() === '' ||
      stat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stat.teamIdentifier?.toLowerCase().includes(searchTerm.toLowerCase());

    const positionMatch = positionFilter === 'all' || stat.position === positionFilter;
    const divisionMatch =
      divisionFilter === 'all' ||
      stat.division === divisionFilter ||
      stat.conference === divisionFilter ||
      stat.league === divisionFilter;

    if (category === 'players') return searchMatch && positionMatch;
    if (category === 'teams') return searchMatch && divisionMatch;
    return searchMatch;
  });

  const sortedStats = [...filteredStats].sort((a, b) => {
    const multiplier = sortDirection === 'desc' ? -1 : 1;
    return (a[sortColumn] - b[sortColumn]) * multiplier;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const renderSortableHeader = (label: string, column: string) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(column)}
      className={cn('h-8 flex items-center gap-2 w-full px-0 justify-end text-right')}
    >
      {label}
      {sortColumn === column ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4 shrink-0" />
        ) : (
          <ArrowDown className="h-4 w-4 shrink-0" />
        )
      ) : (
        <ChevronsUpDown className="h-4 w-4 shrink-0" />
      )}
    </Button>
  );

  const renderPlayerStats = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Pos</TableHead>
          <TableHead className="text-right">{renderSortableHeader('GP', 'gamesPlayed')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('G', 'goals')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('A', 'assists')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('PTS', 'points')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('+/-', 'plusMinus')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('PIM', 'pim')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedStats.map((player) => (
          <TableRow key={player.id}>
            <TableCell>
              <Link href={`/users/${player.id}`} className="hover:text-blue-400">
                {player.name}
              </Link>
            </TableCell>
            <TableCell>{player.teamIdentifier}</TableCell>
            <TableCell>{player.position}</TableCell>
            <TableCell className="text-right">{player.gamesPlayed}</TableCell>
            <TableCell className="text-right">{player.goals}</TableCell>
            <TableCell className="text-right">{player.assists}</TableCell>
            <TableCell className="text-right">{player.points}</TableCell>
            <TableCell className="text-right">
              {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
            </TableCell>
            <TableCell className="text-right">{player.pim}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderGoalieStats = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Goalie</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">{renderSortableHeader('GP', 'gamesPlayed')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('GA', 'goalsAgainst')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('GAA', 'gaa')}</TableHead>
          <TableHead className="text-right">
            {renderSortableHeader('SV%', 'savePercentage')}
          </TableHead>
          <TableHead className="text-right">{renderSortableHeader('SO', 'shutouts')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedStats.map((goalie) => (
          <TableRow key={goalie.id}>
            <TableCell>
              <Link href={`/users/${goalie.id}`} className="hover:text-blue-400">
                {goalie.name}
              </Link>
            </TableCell>
            <TableCell>{goalie.teamIdentifier}</TableCell>
            <TableCell className="text-right">{goalie.gamesPlayed}</TableCell>
            <TableCell className="text-right">{goalie.goalsAgainst}</TableCell>
            <TableCell className="text-right">{goalie.gaa}</TableCell>
            <TableCell className="text-right">{goalie.savePercentage}%</TableCell>
            <TableCell className="text-right">{goalie.shutouts}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderTeamStats = () => {
    // Create a map of team identifiers to colors based on league
    const teamColorsMap = new Map(
      id === 'nhl'
        ? NHL_TEAMS.map((team) => [team.id.toUpperCase(), team.colors])
        : id === 'ahl'
          ? AHL_TEAMS.map((team) => [team.id.toUpperCase(), team.colors])
          : id === 'echl'
            ? ECHL_TEAMS.map((team) => [team.id.toUpperCase(), team.colors])
            : id === 'chl'
              ? CHL_TEAMS.map((team) => [team.id.toUpperCase(), team.colors])
              : []
    );

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead className="text-right">
              {renderSortableHeader('GP', 'gamesPlayed')}
            </TableHead>
            <TableHead className="text-right">{renderSortableHeader('W', 'wins')}</TableHead>
            <TableHead className="text-right">{renderSortableHeader('L', 'losses')}</TableHead>
            <TableHead className="text-right">{renderSortableHeader('OTL', 'otl')}</TableHead>
            <TableHead className="text-right">{renderSortableHeader('PTS', 'points')}</TableHead>
            <TableHead className="text-right">{renderSortableHeader('GF', 'goalsFor')}</TableHead>
            <TableHead className="text-right">
              {renderSortableHeader('GA', 'goalsAgainst')}
            </TableHead>
            <TableHead className="text-right">
              {renderSortableHeader('PP%', 'powerplayPercentage')}
            </TableHead>
            <TableHead className="text-right">
              {renderSortableHeader('PK%', 'penaltyKillPercentage')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStats.map((team) => {
            const teamColors = teamColorsMap.get(team.teamIdentifier);
            const style = teamColors
              ? {
                  background: `linear-gradient(to right, ${teamColors.primary}50, ${teamColors.secondary}60)`,
                  borderLeft: `4px solid ${teamColors.primary}`,
                }
              : {};

            return (
              <TableRow key={team.id} style={style}>
                <TableCell>
                  <Link
                    href={`/leagues/${id}/teams/${team.teamIdentifier}`}
                    className="hover:text-blue-400"
                  >
                    <div className="text-left">
                      <span className="font-bold">{team.teamIdentifier}</span>
                      <span className="text-sm text-gray-400 ml-2">{team.name}</span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">{team.gamesPlayed}</TableCell>
                <TableCell className="text-right">{team.wins}</TableCell>
                <TableCell className="text-right">{team.losses}</TableCell>
                <TableCell className="text-right">{team.otl}</TableCell>
                <TableCell className="text-right font-bold">{team.points}</TableCell>
                <TableCell className="text-right">{team.goalsFor}</TableCell>
                <TableCell className="text-right">{team.goalsAgainst}</TableCell>
                <TableCell className="text-right">
                  {(team.powerplayPercentage * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {(team.penaltyKillPercentage * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Nav removed - handled by parent layout */}

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
            <h1 className="text-4xl font-bold text-white">{league.name} Statistics</h1>
          </div>
        </div>
      </div>

      <LeagueNav leagueId={id} />

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Tabs
                defaultValue="players"
                onValueChange={(value) => setCategory(value as StatCategory)}
              >
                <TabsList>
                  <TabsTrigger value="players">Players</TabsTrigger>
                  <TabsTrigger value="goalies">Goalies</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                </TabsList>
              </Tabs>

              {category === 'players' && (
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-800/50 border-white/20 text-white">
                    <SelectValue placeholder="Position" className="text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    <SelectItem value="all">All Positions</SelectItem>
                    <SelectItem value="C">Center</SelectItem>
                    <SelectItem value="LW">Left Wing</SelectItem>
                    <SelectItem value="RW">Right Wing</SelectItem>
                    <SelectItem value="LD">Left Defense</SelectItem>
                    <SelectItem value="RD">Right Defense</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {category === 'teams' && (
                <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-800/50 border-white/20 text-white">
                    <SelectValue placeholder="Division/Conference" className="text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    <SelectItem value="all">All Teams</SelectItem>
                    {id === 'nhl' &&
                      [
                        ...new Set([
                          ...NHL_TEAMS.map((team) => team.conference),
                          ...NHL_TEAMS.map((team) => team.division),
                        ]),
                      ]
                        .filter(Boolean)
                        .map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                    {id === 'ahl' &&
                      [...new Set(AHL_TEAMS.map((team) => team.division))]
                        .filter(Boolean)
                        .map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                    {id === 'echl' &&
                      [...new Set(ECHL_TEAMS.map((team) => team.division))]
                        .filter(Boolean)
                        .map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                    {id === 'chl' &&
                      [...new Set(CHL_TEAMS.map((team) => team.league))]
                        .filter(Boolean)
                        .map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
            />
          </div>

          {/* Stats Table */}
          <div className="bg-gray-800/50 rounded-lg border border-white/10 overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">Loading statistics...</div>
            ) : (
              <>
                {category === 'players' && renderPlayerStats()}
                {category === 'goalies' && renderGoalieStats()}
                {category === 'teams' && renderTeamStats()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
