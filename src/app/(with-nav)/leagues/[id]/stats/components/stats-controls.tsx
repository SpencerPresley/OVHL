'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCategory } from '../types';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';

interface StatsControlsProps {
  category: StatCategory;
  onCategoryChange: (category: StatCategory) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  positionFilter: string;
  onPositionFilterChange: (position: string) => void;
  divisionFilter: string;
  onDivisionFilterChange: (division: string) => void;
  leagueId: string;
}

export function StatsControls({
  category,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  positionFilter,
  onPositionFilterChange,
  divisionFilter,
  onDivisionFilterChange,
  leagueId,
}: StatsControlsProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <Tabs
          value={category}
          onValueChange={(value) => onCategoryChange(value as StatCategory)}
        >
          <TabsList>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="goalies">Goalies</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>
        </Tabs>

        {category === 'players' && (
          <Select value={positionFilter} onValueChange={onPositionFilterChange}>
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
          <Select value={divisionFilter} onValueChange={onDivisionFilterChange}>
            <SelectTrigger className="w-[180px] bg-gray-800/50 border-white/20 text-white">
              <SelectValue placeholder="Division/Conference" className="text-gray-400" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-white/20">
              <SelectItem value="all">All Teams</SelectItem>
              {leagueId === 'nhl' &&
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
              {leagueId === 'ahl' &&
                [...new Set(AHL_TEAMS.map((team) => team.division))]
                  .filter(Boolean)
                  .map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
              {leagueId === 'echl' &&
                [...new Set(ECHL_TEAMS.map((team) => team.division))]
                  .filter(Boolean)
                  .map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
              {leagueId === 'chl' &&
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
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
      />
    </div>
  );
}