'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

type StatCategory = 'Points' | 'Goals' | 'Assists' | '+/-' | 'SV%' | 'GAA' | 'Wins' | 'PP%' | 'PK%';

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
  const [selectedStat, setSelectedStat] = useState<StatCategory>('Points');
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const encodedCategory = encodeURIComponent(selectedStat);
        const response = await fetch(
          `/api/leagues/${leagueId}/quick-stats?category=${encodedCategory}`
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
      <Tabs defaultValue="Points" onValueChange={(value) => setSelectedStat(value as StatCategory)}>
        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsTrigger value="Points">Points</TabsTrigger>
          <TabsTrigger value="Goals">Goals</TabsTrigger>
          <TabsTrigger value="Assists">Assists</TabsTrigger>
          <TabsTrigger value="+/-">+/-</TabsTrigger>
          <TabsTrigger value="SV%">SV%</TabsTrigger>
          <TabsTrigger value="GAA">GAA</TabsTrigger>
          <TabsTrigger value="Wins">Wins</TabsTrigger>
          <TabsTrigger value="PP%">PP%</TabsTrigger>
          <TabsTrigger value="PK%">PK%</TabsTrigger>
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
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-gray-400 w-6">{index + 1}</span>
                  <div className="h-5 w-32 bg-gray-700 rounded"></div>
                </div>
                <div className="h-5 w-16 bg-gray-700 rounded"></div>
              </div>
            ))
          : stats.map((stat, index) => (
              <div
                key={stat.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-gray-400 w-6">{index + 1}</span>
                  <div>
                    {stat.isTeamStat ? (
                      <Link
                        href={`/leagues/${stat.teamIdentifier}`}
                        className="hover:text-blue-400"
                      >
                        {stat.name}
                      </Link>
                    ) : (
                      <Link href={`/users/${stat.id}`} className="hover:text-blue-400">
                        {stat.gamertag || stat.name}
                      </Link>
                    )}
                    {!stat.isTeamStat && (
                      <div className="text-xs text-gray-500">{stat.teamIdentifier}</div>
                    )}
                  </div>
                </div>
                <span className="font-mono">{stat.formattedValue}</span>
              </div>
            ))}
      </div>
    </div>
  );
}
