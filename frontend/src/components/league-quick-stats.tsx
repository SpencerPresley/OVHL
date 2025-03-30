'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

type StatCategory =
  | 'POINTS'
  | 'GOALS'
  | 'ASSISTS'
  | 'PLUSMINUS'
  | 'SAVEPCT'
  | 'GAA'
  | 'WINS'
  | 'POWERPLAY'
  | 'PENALTYKILL';

const STAT_DISPLAY_NAMES: Record<StatCategory, string> = {
  POINTS: 'Points',
  GOALS: 'Goals',
  ASSISTS: 'Assists',
  PLUSMINUS: '+/-',
  SAVEPCT: 'SV%',
  GAA: 'GAA',
  WINS: 'Wins',
  POWERPLAY: 'PP%',
  PENALTYKILL: 'PK%',
};

interface Stat {
  id: string;
  name: string;
  gamertag?: string;
  value: number;
  formattedValue: string;
  teamIdentifier: string;
  isTeamStat: boolean;
}

// Type for the state holding all stats, keyed by category
type AllStatsData = Partial<Record<StatCategory, Stat[]>>;

interface LeagueQuickStatsProps {
  leagueId: string;
}

export function LeagueQuickStats({ leagueId }: LeagueQuickStatsProps) {
  const [selectedStat, setSelectedStat] = useState<StatCategory>('POINTS');
  // State to hold all fetched stats data
  const [allStats, setAllStats] = useState<AllStatsData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for error message

  useEffect(() => {
    const fetchAllStats = async () => {
      // Reset state when leagueId changes
      setIsLoading(true);
      setError(null);
      setAllStats({}); // Clear old stats if leagueId changes

      try {
        // Fetch without the category parameter - API should return all stats
        const response = await fetch(
          `/api/leagues/${leagueId}/quick-stats` // Removed category query param
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to get error details
          throw new Error(errorData.error || `Failed to fetch stats (${response.status})`);
        }
        // Expecting response format like: { stats: { POINTS: [...], GOALS: [...], ... } }
        const data = await response.json();

        // Validate the received structure slightly
        if (!data || typeof data.stats !== 'object' || data.stats === null) {
          throw new Error('Invalid stats data format received from API');
        }

        // Store the entire stats object
        setAllStats(data.stats);

      } catch (err) {
        console.error('Error fetching all stats:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setAllStats({}); // Clear stats on error
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data only when the leagueId changes
    if (leagueId) {
      fetchAllStats();
    } else {
      // Handle case where leagueId might be initially undefined or null
      setIsLoading(false);
      setError('League ID is missing');
      setAllStats({});
    }

  }, [leagueId]); // Dependency array only includes leagueId

  // Derive the stats to display based on the selected tab and the fetched data
  const statsToDisplay = allStats[selectedStat] || [];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="POINTS" onValueChange={(value) => setSelectedStat(value as StatCategory)}>
        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full overflow-x-auto flex-wrap sm:flex-nowrap">
          {Object.entries(STAT_DISPLAY_NAMES).map(([value, display]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
            >
              {display}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Display Error Message */}
      {error && !isLoading && (
        <div className="p-4 text-center text-red-500 bg-red-900/20 rounded-lg">
          <p>Could not load stats:</p>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Display Loading or Stats */}
      <div className="space-y-2">
        {isLoading
          ? // Loading skeleton remains the same
            Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 animate-pulse"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-xs sm:text-sm font-mono text-gray-400 w-5 sm:w-6">
                    {index + 1}
                  </span>
                  <div className="h-5 w-24 sm:w-32 bg-gray-700 rounded"></div>
                </div>
                <div className="h-5 w-12 sm:w-16 bg-gray-700 rounded"></div>
              </div>
            ))
          : // Display stats derived from allStats based on selectedStat
            statsToDisplay.map((stat, index) => (
              <div
                key={stat.id} // Use stat.id as key when available
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <span className="text-xs sm:text-sm font-mono text-gray-400 w-5 sm:w-6 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 overflow-hidden">
                    {stat.isTeamStat ? (
                      <Link
                        href={`/teams/${stat.teamIdentifier}`} // Assuming link is to team page using identifier/abbreviation
                        className="hover:text-blue-400 text-sm sm:text-base truncate block"
                      >
                        {stat.name}
                      </Link>
                    ) : (
                      <Link
                        href={`/users/${stat.id}`} // Link to user profile using user ID
                        className="hover:text-blue-400 text-sm sm:text-base truncate block"
                      >
                        {stat.gamertag || stat.name}
                      </Link>
                    )}
                    {!stat.isTeamStat && stat.teamIdentifier && ( // Show team identifier for players if available
                      <div className="text-xs text-gray-500 truncate">{stat.teamIdentifier}</div>
                    )}
                  </div>
                </div>
                <span className="font-mono text-sm sm:text-base ml-2 flex-shrink-0">
                  {stat.formattedValue}
                </span>
              </div>
            ))}

        {/* Display message if no stats available for the selected category */}
        {!isLoading && !error && statsToDisplay.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No {STAT_DISPLAY_NAMES[selectedStat]} stats available for this league.
          </div>
        )}
      </div>
    </div>
  );
}
