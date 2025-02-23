'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersProps {
  positionFilter: string[];
  setPositionFilter: (value: string[]) => void;
  bidStatusFilter: string;
  setBidStatusFilter: (value: string) => void;
  priceSort: 'asc' | 'desc' | null;
  setPriceSort: (value: 'asc' | 'desc' | null) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  totalPlayers: number;
  filteredCount: number;
  isDetailedView: boolean;
  setIsDetailedView: (value: boolean) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const POSITIONS = [
  { id: 'C', label: 'Center', color: 'text-red-400', group: 'forwards' },
  { id: 'LW', label: 'Left Wing', color: 'text-green-400', group: 'forwards' },
  { id: 'RW', label: 'Right Wing', color: 'text-blue-400', group: 'forwards' },
  { id: 'LD', label: 'Left Defense', color: 'text-teal-400', group: 'defense' },
  { id: 'RD', label: 'Right Defense', color: 'text-yellow-400', group: 'defense' },
  { id: 'G', label: 'Goalie', color: 'text-purple-400', group: 'goalie' },
] as const;

type PositionGroup = 'all' | 'forwards' | 'defense';

const POSITION_GROUPS: Record<PositionGroup, { label: string; positions: string[] }> = {
  all: { label: 'All Positions', positions: POSITIONS.map((p) => p.id) },
  forwards: {
    label: 'All Forwards',
    positions: POSITIONS.filter((p) => p.group === 'forwards').map((p) => p.id),
  },
  defense: {
    label: 'All Defense',
    positions: POSITIONS.filter((p) => p.group === 'defense').map((p) => p.id),
  },
};

export function Filters({
  positionFilter,
  setPositionFilter,
  bidStatusFilter,
  setBidStatusFilter,
  priceSort,
  setPriceSort,
  searchQuery,
  setSearchQuery,
  totalPlayers,
  filteredCount,
  isDetailedView,
  setIsDetailedView,
  isOpen,
  setIsOpen,
}: FiltersProps) {
  const hasActiveFilters =
    positionFilter.length > 0 ||
    bidStatusFilter !== 'all' ||
    priceSort !== null ||
    searchQuery !== '';

  const isAllSelected = POSITION_GROUPS.all.positions.every((p) => positionFilter.includes(p));
  const isForwardsSelected = POSITION_GROUPS.forwards.positions.every((p) =>
    positionFilter.includes(p)
  );
  const isDefenseSelected = POSITION_GROUPS.defense.positions.every((p) =>
    positionFilter.includes(p)
  );

  const handleGroupChange = (group: 'all' | 'forwards' | 'defense', checked: boolean) => {
    if (checked) {
      if (group === 'all') {
        setPositionFilter(POSITION_GROUPS.all.positions);
      } else {
        const otherPositions = positionFilter.filter(
          (p) => !POSITION_GROUPS[group].positions.includes(p)
        );
        setPositionFilter([...otherPositions, ...POSITION_GROUPS[group].positions]);
      }
    } else {
      if (group === 'all') {
        setPositionFilter([]);
      } else {
        setPositionFilter(
          positionFilter.filter((p) => !POSITION_GROUPS[group].positions.includes(p))
        );
      }
    }
  };

  const handlePositionChange = (position: string, checked: boolean) => {
    if (checked) {
      setPositionFilter([...positionFilter, position]);
    } else {
      setPositionFilter(positionFilter.filter((p) => p !== position));
    }
  };

  const isPositionDisabled = (position: string) => {
    if (isAllSelected) return true;
    if (isForwardsSelected && POSITIONS.find((p) => p.id === position)?.group === 'forwards')
      return true;
    if (isDefenseSelected && POSITIONS.find((p) => p.id === position)?.group === 'defense')
      return true;
    return false;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="card-gradient rounded-lg">
      <CollapsibleTrigger className="w-full flex items-center justify-between p-6 cursor-pointer">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Active Filters
            </Badge>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-6 pb-6">
          {/* Position filters */}
          <div>
            <Label className="mb-4 block">Positions</Label>
            {/* Group selectors */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="position-all"
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleGroupChange('all', checked as boolean)}
                />
                <label htmlFor="position-all" className="text-sm font-medium leading-none">
                  All Positions
                </label>
              </div>
              <div className="flex items-center space-x-2 lg:-ml-2">
                <Checkbox
                  id="position-forwards"
                  checked={isForwardsSelected}
                  disabled={isAllSelected}
                  onCheckedChange={(checked) => handleGroupChange('forwards', checked as boolean)}
                />
                <label
                  htmlFor="position-forwards"
                  className={`text-sm font-medium leading-none ${isAllSelected ? 'opacity-50' : ''}`}
                >
                  All Forwards
                </label>
              </div>
              <div className="flex items-center space-x-2 lg:-ml-2">
                <Checkbox
                  id="position-defense"
                  checked={isDefenseSelected}
                  disabled={isAllSelected}
                  onCheckedChange={(checked) => handleGroupChange('defense', checked as boolean)}
                />
                <label
                  htmlFor="position-defense"
                  className={`text-sm font-medium leading-none ${isAllSelected ? 'opacity-50' : ''}`}
                >
                  All Defense
                </label>
              </div>
            </div>

            {/* Individual positions */}
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-none lg:flex lg:flex-row lg:gap-8">
              {/* Forwards */}
              <div className="contents lg:flex lg:flex-row lg:gap-4">
                {POSITIONS.filter((p) => p.group === 'forwards').map((position) => (
                  <div key={position.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`position-${position.id}`}
                      checked={positionFilter.includes(position.id)}
                      disabled={isPositionDisabled(position.id)}
                      onCheckedChange={(checked) =>
                        handlePositionChange(position.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`position-${position.id}`}
                      className={cn(
                        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed whitespace-nowrap',
                        position.color,
                        isPositionDisabled(position.id) ? 'opacity-50' : ''
                      )}
                    >
                      {position.label}
                    </label>
                  </div>
                ))}
              </div>

              {/* Defense */}
              <div className="contents lg:flex lg:flex-row lg:gap-4">
                {POSITIONS.filter((p) => p.group === 'defense').map((position) => (
                  <div key={position.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`position-${position.id}`}
                      checked={positionFilter.includes(position.id)}
                      disabled={isPositionDisabled(position.id)}
                      onCheckedChange={(checked) =>
                        handlePositionChange(position.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`position-${position.id}`}
                      className={cn(
                        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed whitespace-nowrap',
                        position.color,
                        isPositionDisabled(position.id) ? 'opacity-50' : ''
                      )}
                    >
                      {position.label}
                    </label>
                  </div>
                ))}
              </div>

              {/* Goalie */}
              <div className="contents lg:block">
                {POSITIONS.filter((p) => p.group === 'goalie').map((position) => (
                  <div key={position.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`position-${position.id}`}
                      checked={positionFilter.includes(position.id)}
                      disabled={isPositionDisabled(position.id)}
                      onCheckedChange={(checked) =>
                        handlePositionChange(position.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`position-${position.id}`}
                      className={cn(
                        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed whitespace-nowrap',
                        position.color,
                        isPositionDisabled(position.id) ? 'opacity-50' : ''
                      )}
                    >
                      {position.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="mb-2 block">Bid Status</Label>
              <Select value={bidStatusFilter} onValueChange={setBidStatusFilter}>
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

            <div>
              <Label className="mb-2 block">Sort by Price</Label>
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

            <div>
              <Label className="mb-2 block">Search</Label>
              <Input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-3 block">View</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="detailed-view"
                  checked={isDetailedView}
                  onCheckedChange={setIsDetailedView}
                />
                <label
                  htmlFor="detailed-view"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Detailed View
                </label>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCount} of {totalPlayers} players
            </p>
            <div className="flex flex-wrap gap-2">
              {positionFilter.map((pos) => (
                <Badge key={pos} variant="secondary" className="text-xs">
                  {POSITIONS.find((p) => p.id === pos)?.label || pos}
                </Badge>
              ))}
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
