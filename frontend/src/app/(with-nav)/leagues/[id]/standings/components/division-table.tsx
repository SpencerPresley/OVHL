'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

interface TeamStats {
  teamId: string;
  teamSeasonId: string;
  teamName: string;
  teamAbbreviation: string;
  logoPath: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
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

interface DivisionTableProps {
  division: string;
  teams: TeamStats[];
  leagueId: string;
}

export function DivisionTable({ division, teams, leagueId }: DivisionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<TeamStats>[] = [
    {
      accessorKey: 'teamName',
      header: 'Team',
      cell: ({ row }) => (
        <Link
          href={`/leagues/${leagueId}/teams/${row.original.teamAbbreviation}`}
          className="hover:opacity-75 flex items-center gap-2 group"
        >
          {row.original.logoPath ? (
            <div
              style={{
                width: 48,
                height: 48,
                position: "relative",
              }}>
            <Image
              src={row.original.logoPath}
              alt={row.original.teamName}
              layout="fill"
              objectFit="contain"
            />
            </div>

           ) : (
              <div className="w-6 h-6 bg-gray-700 rounded-sm flex-shrink-0"></div>
           )}

          <div className="text-left overflow-hidden whitespace-nowrap">
             <span className="font-bold inline lg:hidden group-hover:text-blue-400 transition-colors">{row.original.teamAbbreviation}</span>
            <span className="font-bold hidden lg:inline group-hover:text-blue-400 transition-colors">{row.original.teamName}</span>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: 'gamesPlayed',
      header: 'GP',
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.gamesPlayed}</div>,
    },
    {
      accessorKey: 'wins',
      header: 'W',
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.wins}</div>,
    },
    {
      accessorKey: 'losses',
      header: 'L',
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.losses}</div>,
    },
    {
      accessorKey: 'points',
      header: 'PTS',
      cell: ({ row }) => <div className="text-right font-bold tabular-nums">{row.original.points}</div>,
    },
    {
      accessorKey: 'goalsFor',
      header: 'GF',
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.goalsFor}</div>,
    },
    {
      accessorKey: 'goalsAgainst',
      header: 'GA',
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.goalsAgainst}</div>,
    },
    {
      accessorKey: 'goalDifferential',
      header: 'DIFF',
       cell: ({ row }) => {
         const diff = row.original.goalDifferential;
         const diffText = diff > 0 ? `+${diff}` : diff.toString();
         const diffColor = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400';
         return <div className={cn("text-right font-medium tabular-nums", diffColor)}>{diffText}</div>;
       },
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
      <h2 className="text-2xl font-bold mb-4 tracking-tight text-gray-200">{division} Division</h2>
      <div className="rounded-md border border-gray-700/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-700">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-400 font-semibold">
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          'h-8 flex items-center gap-1 w-full px-2 hover:bg-gray-700/50',
                          header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                          header.column.id === 'teamName'
                            ? 'justify-start text-left'
                            : 'justify-end text-right'
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ArrowUp className="h-3 w-3 shrink-0" />,
                          desc: <ArrowDown className="h-3 w-3 shrink-0" />,
                        }[header.column.getIsSorted() as string] ??
                          (header.column.getCanSort() ? (
                            <ChevronsUpDown className="h-3 w-3 shrink-0 text-gray-500" />
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
              table.getRowModel().rows.map((row, index) => {
                const primaryColor = row.original.primaryColor || '#374151';
                const secondaryColor = row.original.secondaryColor || '#4b5563';

                const style = {
                  background: `linear-gradient(to right, ${primaryColor}20, ${secondaryColor}30)`,
                  borderLeft: `3px solid ${primaryColor}`,
                };

                return (
                  <TableRow
                     key={row.id}
                     style={style}
                     className="border-gray-700/50 hover:bg-gray-700/30"
                     data-state={row.getIsSelected() && 'selected'}
                   >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 px-2 text-sm text-gray-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="border-gray-700/50">
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  No standings data available for this division.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
