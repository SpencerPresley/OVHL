'use client';

import { useState, useMemo } from 'react';
import { StatsControls } from './stats-controls';
import { PlayerStatsTable } from './tables/player-stats-table';
import { GoalieStatsTable } from './tables/goalie-stats-table';
import { TeamStatsTable } from './tables/team-stats-table';
import { PlayerStats, GoalieStats, TeamStats, StatCategory } from '../types';

interface StatsContentProps {
  leagueId: string;
  playerStats: PlayerStats[];
  goalieStats: GoalieStats[];
  teamStats: TeamStats[];
}

export function StatsContent({ 
  leagueId, 
  playerStats, 
  goalieStats, 
  teamStats 
}: StatsContentProps) {
  const [category, setCategory] = useState<StatCategory>('players');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [positionFilter, setPositionFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  
  // Improve type safety with type guards
  const filteredAndSortedStats = useMemo(() => {
    // Select the appropriate data based on category
    let statsToProcess: PlayerStats[] | GoalieStats[] | TeamStats[] = [];
    
    if (category === 'players') {
      statsToProcess = playerStats;
    } else if (category === 'goalies') {
      statsToProcess = goalieStats;
    } else if (category === 'teams') {
      statsToProcess = teamStats;
    }
    
    // Apply filters
    const filtered = statsToProcess.filter((stat) => {
      // Common search filter across all types
      const searchMatch =
        searchTerm.toLowerCase().trim() === '' ||
        ('name' in stat && stat.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (stat.teamIdentifier && stat.teamIdentifier.toLowerCase().includes(searchTerm.toLowerCase()));

      // Apply category-specific filters
      if (category === 'players') {
        // Type assertion for PlayerStats
        const playerStat = stat as PlayerStats;
        const positionMatch = positionFilter === 'all' || playerStat.position === positionFilter;
        return searchMatch && positionMatch;
      }
      
      if (category === 'teams') {
        // Type assertion for TeamStats  
        const teamStat = stat as TeamStats;
        const divisionMatch =
          divisionFilter === 'all' ||
          (teamStat.division && teamStat.division === divisionFilter) ||
          (teamStat.conference && teamStat.conference === divisionFilter) ||
          (teamStat.league && teamStat.league === divisionFilter);
        return searchMatch && divisionMatch;
      }
      
      // Default case (goalies or unknown)
      return searchMatch;
    });
    
    // Sort the filtered stats
    return [...filtered].sort((a, b) => {
      const multiplier = sortDirection === 'desc' ? -1 : 1;
      
      // Safely access properties for sorting
      const aValue = sortColumn in a ? (a as any)[sortColumn] : 0;
      const bValue = sortColumn in b ? (b as any)[sortColumn] : 0;
      
      return (aValue - bValue) * multiplier;
    });
  }, [
    category, playerStats, goalieStats, teamStats, 
    searchTerm, sortColumn, sortDirection, positionFilter, divisionFilter
  ]);

  // Sort handler
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      <StatsControls 
        category={category}
        onCategoryChange={setCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        positionFilter={positionFilter}
        onPositionFilterChange={setPositionFilter}
        divisionFilter={divisionFilter}
        onDivisionFilterChange={setDivisionFilter}
        leagueId={leagueId}
      />
      
      <div className="bg-gray-800/50 rounded-lg border border-white/10 overflow-x-auto">
        {category === 'players' && (
          <PlayerStatsTable 
            stats={filteredAndSortedStats as PlayerStats[]} 
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )}
        {category === 'goalies' && (
          <GoalieStatsTable 
            stats={filteredAndSortedStats as GoalieStats[]}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )}
        {category === 'teams' && (
          <TeamStatsTable 
            stats={filteredAndSortedStats as TeamStats[]}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            leagueId={leagueId}
          />
        )}
      </div>
    </div>
  );
}