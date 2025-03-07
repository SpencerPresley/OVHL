'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeamStats } from '../../types';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';

interface TeamStatsTableProps {
  stats: TeamStats[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  leagueId: string;
}

export function TeamStatsTable({
  stats,
  sortColumn,
  sortDirection,
  onSort,
  leagueId,
}: TeamStatsTableProps) {
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

  const renderSortableHeader = (label: string, column: string) => (
    <Button
      variant="ghost"
      onClick={() => onSort(column)}
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">{renderSortableHeader('GP', 'gamesPlayed')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('W', 'wins')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('L', 'losses')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('OTL', 'otl')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('PTS', 'points')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('GF', 'goalsFor')}</TableHead>
          <TableHead className="text-right">{renderSortableHeader('GA', 'goalsAgainst')}</TableHead>
          <TableHead className="text-right">
            {renderSortableHeader('PP%', 'powerplayPercentage')}
          </TableHead>
          <TableHead className="text-right">
            {renderSortableHeader('PK%', 'penaltyKillPercentage')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map((team) => {
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
                  href={`/leagues/${leagueId}/teams/${team.teamIdentifier}`}
                  className="hover:text-blue-400"
                >
                  <div className="text-left">
                    <span className="font-bold">{team.teamIdentifier}</span>
                    <span className="text-sm text-gray-400 ml-2">{team.teamName}</span>
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
}
