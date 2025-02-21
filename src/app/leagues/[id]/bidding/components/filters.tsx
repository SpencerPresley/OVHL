'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface FiltersProps {
  positionFilter: string;
  setPositionFilter: (value: string) => void;
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
  const hasActiveFilters = positionFilter !== 'all' || 
                          bidStatusFilter !== 'all' || 
                          priceSort !== null || 
                          searchQuery !== '';

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
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                  <SelectItem value="forward">All Forwards</SelectItem>
                  <SelectItem value="C">Center</SelectItem>
                  <SelectItem value="LW">Left Wing</SelectItem>
                  <SelectItem value="RW">Right Wing</SelectItem>
                  <SelectItem value="defense">All Defense</SelectItem>
                  <SelectItem value="LD">Left Defense</SelectItem>
                  <SelectItem value="RD">Right Defense</SelectItem>
                  <SelectItem value="G">Goalie</SelectItem>
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

            <div className="space-y-2">
              <Label>View</Label>
              <div className="flex items-center space-x-2 pt-2">
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
} 