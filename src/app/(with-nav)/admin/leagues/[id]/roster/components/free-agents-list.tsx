'use client';

import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FreeAgentCard } from './free-agent-card';
import { UserSearch } from '@/components/user-search';

interface FreeAgentsListProps {
  freeAgents: {
    id: string;
    name: string;
    position: string;
    gamertag: string;
    contract: {
      amount: number;
    };
  }[];
  teams: {
    id: string;
    officialName: string;
    teamIdentifier: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  }[];
  onAddToTeam: (playerId: string, teamId: string) => void;
  loading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function FreeAgentsList({ freeAgents, teams, onAddToTeam, loading }: FreeAgentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [positionFilter, setPositionFilter] = useState<string>('all');

  // Filter and paginate free agents
  const filteredAndPaginatedFreeAgents = useMemo(() => {
    let filtered = freeAgents;

    // Apply search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(search) ||
          player.gamertag.toLowerCase().includes(search)
      );
    }

    // Apply position filter
    if (positionFilter !== 'all') {
      if (positionFilter === 'forwards') {
        filtered = filtered.filter((p) => ['C', 'LW', 'RW'].includes(p.position));
      } else if (positionFilter === 'defense') {
        filtered = filtered.filter((p) => ['LD', 'RD'].includes(p.position));
      } else if (positionFilter === 'G') {
        filtered = filtered.filter((p) => p.position === 'G');
      }
    }

    // Paginate
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  }, [freeAgents, searchQuery, positionFilter, currentPage]);

  const totalPages = Math.ceil(freeAgents.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Free Agents</h2>
        <div className="flex gap-4">
          <UserSearch
            onSelect={(userId) => {
              const player = freeAgents.find((p) => p.id === userId);
              if (player) {
                setSearchQuery(player.name);
              }
            }}
            teamId={teams[0]?.id || ''}
            className="min-w-[200px]"
          />
          <Select
            value={positionFilter}
            onValueChange={(value) => {
              setPositionFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="forwards">Forwards</SelectItem>
              <SelectItem value="defense">Defense</SelectItem>
              <SelectItem value="G">Goalies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAndPaginatedFreeAgents.map((player) => (
          <FreeAgentCard key={player.id} player={player} teams={teams} onAddToTeam={onAddToTeam} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
