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
import { PlayerStats } from '../../types';

interface PlayerStatsTableProps {
  stats: PlayerStats[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export function PlayerStatsTable({
  stats,
  sortColumn,
  sortDirection,
  onSort,
}: PlayerStatsTableProps) {
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
        {stats.map((player) => (
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
}
