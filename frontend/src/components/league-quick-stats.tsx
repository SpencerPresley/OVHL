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

interface LeagueQuickStatsProps {
  leagueId: string;
}

export function LeagueQuickStats({ leagueId }: LeagueQuickStatsProps) {
  const [selectedStat, setSelectedStat] = useState<StatCategory>('POINTS');
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/leagues/${leagueId}/quick-stats?category=${selectedStat}`
        );
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedStat, leagueId]);

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

      <div className="space-y-2">
        {isLoading
          ? // Loading state
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
          : stats.map((stat, index) => (
              <div
                key={stat.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <span className="text-xs sm:text-sm font-mono text-gray-400 w-5 sm:w-6 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 overflow-hidden">
                    {stat.isTeamStat ? (
                      <Link
                        href={`/leagues/${stat.teamIdentifier}`}
                        className="hover:text-blue-400 text-sm sm:text-base truncate block"
                      >
                        {stat.name}
                      </Link>
                    ) : (
                      <Link
                        href={`/users/${stat.id}`}
                        className="hover:text-blue-400 text-sm sm:text-base truncate block"
                      >
                        {stat.gamertag || stat.name}
                      </Link>
                    )}
                    {!stat.isTeamStat && (
                      <div className="text-xs text-gray-500 truncate">{stat.teamIdentifier}</div>
                    )}
                  </div>
                </div>
                <span className="font-mono text-sm sm:text-base ml-2 flex-shrink-0">
                  {stat.formattedValue}
                </span>
              </div>
            ))}
      </div>
    </div>
  );
}
