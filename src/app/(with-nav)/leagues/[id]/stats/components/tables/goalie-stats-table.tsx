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
import { GoalieStats } from '../../types';

interface GoalieStatsTableProps {
  stats: GoalieStats[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export function GoalieStatsTable({
  stats,
  sortColumn,
  sortDirection,
  onSort,
}: GoalieStatsTableProps) {
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
        {stats.map((goalie) => (
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
}
