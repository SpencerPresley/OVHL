'use client';

import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
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

interface TeamStats {
  teamId: string;
  teamName: string;
  teamIdentifier: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  powerplayGoals: number;
  powerplayOpportunities: number;
  powerplayPercentage: number;
  penaltyKillGoalsAgainst: number;
  penaltyKillOpportunities: number;
  penaltyKillPercentage: number;
}

interface DivisionStandings {
  division: string;
  teams: TeamStats[];
}

interface StandingsDisplayProps {
  league: League;
}

function DivisionTable({
  division,
  teams,
  leagueId,
}: {
  division: string;
  teams: TeamStats[];
  leagueId: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Create a map of team identifiers to colors based on league
  const teamColorsMap = new Map(
    leagueId === 'nhl'
      ? NHL_TEAMS.map((team) => [team.id.toUpperCase(), team.colors])
      : leagueId === 'ahl'
        ? AHL_TEAMS.map((team) => [team.id.toUpperCase(), team.colors])
        : leagueId === 'echl'
          ? ECHL_TEAMS.map((team) => [team.id.toUpperCase(), team.colors])
          : leagueId === 'chl'
            ? CHL_TEAMS.map((team) => [team.id.toUpperCase(), team.colors])
            : []
  );

  const columns: ColumnDef<TeamStats>[] = [
    {
      accessorKey: 'teamIdentifier',
      header: 'Team',
      cell: ({ row }) => (
        <Link
          href={`/leagues/${leagueId}/teams/${row.original.teamIdentifier}`}
          className="hover:opacity-75"
        >
          <div className="text-left">
            <span className="font-bold">{row.original.teamIdentifier}</span>
            <span className="text-sm text-gray-400 ml-2">{row.original.teamName}</span>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: 'gamesPlayed',
      header: 'GP',
      cell: ({ row }) => <div className="text-right">{row.original.gamesPlayed}</div>,
    },
    {
      accessorKey: 'wins',
      header: 'W',
      cell: ({ row }) => <div className="text-right">{row.original.wins}</div>,
    },
    {
      accessorKey: 'losses',
      header: 'L',
      cell: ({ row }) => <div className="text-right">{row.original.losses}</div>,
    },
    {
      accessorKey: 'otLosses',
      header: 'OTL',
      cell: ({ row }) => <div className="text-right">{row.original.otLosses}</div>,
    },
    {
      accessorKey: 'points',
      header: 'PTS',
      cell: ({ row }) => <div className="text-right font-bold">{row.original.points}</div>,
    },
    {
      accessorKey: 'goalsFor',
      header: 'GF',
      cell: ({ row }) => <div className="text-right">{row.original.goalsFor}</div>,
    },
    {
      accessorKey: 'goalsAgainst',
      header: 'GA',
      cell: ({ row }) => <div className="text-right">{row.original.goalsAgainst}</div>,
    },
    {
      accessorKey: 'goalDifferential',
      header: 'DIFF',
      cell: ({ row }) => <div className="text-right">{row.original.goalDifferential}</div>,
    },
    {
      accessorKey: 'powerplayPercentage',
      header: 'PP%',
      cell: ({ row }) => (
        <div className="text-right">{row.original.powerplayPercentage.toFixed(1)}%</div>
      ),
    },
    {
      accessorKey: 'penaltyKillPercentage',
      header: 'PK%',
      cell: ({ row }) => (
        <div className="text-right">{row.original.penaltyKillPercentage.toFixed(1)}%</div>
      ),
    },
  ];

  const table = useReactTable({
    data: teams,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">{division} Division</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          'h-8 flex items-center gap-2 w-full px-0',
                          header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                          header.column.id === 'teamIdentifier'
                            ? 'justify-start text-left'
                            : 'justify-end text-right'
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ArrowUp className="h-4 w-4 shrink-0" />,
                          desc: <ArrowDown className="h-4 w-4 shrink-0" />,
                        }[header.column.getIsSorted() as string] ??
                          (header.column.getCanSort() ? (
                            <ChevronsUpDown className="h-4 w-4 shrink-0" />
                          ) : null)}
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const teamColors = teamColorsMap.get(row.original.teamIdentifier);
                const style = teamColors
                  ? {
                      background: `linear-gradient(to right, ${teamColors.primary}50, ${teamColors.secondary}60)`,
                      borderLeft: `4px solid ${teamColors.primary}`,
                    }
                  : {};

                return (
                  <TableRow key={row.id} style={style}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function StandingsDisplay({ league }: StandingsDisplayProps) {
  const [standings, setStandings] = useState<DivisionStandings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch(`/api/leagues/${league.id}/standings`);
        if (!response.ok) throw new Error('Failed to fetch standings');
        const data = await response.json();
        setStandings(data.standings);
      } catch (error) {
        console.error('Error fetching standings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandings();
  }, [league.id]);

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
            <h1 className="text-4xl font-bold text-white">{league.name} Standings</h1>
          </div>
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* Standings Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div>Loading standings...</div>
        ) : (
          standings.map((divisionStandings) => (
            <DivisionTable
              key={divisionStandings.division}
              division={divisionStandings.division}
              teams={divisionStandings.teams}
              leagueId={league.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
