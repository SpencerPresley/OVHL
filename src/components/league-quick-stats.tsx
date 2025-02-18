'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

type StatCategory = 'Points' | 'Goals' | 'Assists' | '+/-' | 'SV%' | 'GAA' | 'Wins' | 'PP%' | 'PK%';

interface PlayerStat {
  id: string;
  name: string;
  gamertag: string;
  value: number;
  teamIdentifier: string;
}

interface LeagueQuickStatsProps {
  stats: {
    points: PlayerStat[];
    goals: PlayerStat[];
    assists: PlayerStat[];
    plusMinus: PlayerStat[];
    savePercentage: PlayerStat[];
    gaa: PlayerStat[];
    teamWins: PlayerStat[];
    teamPowerPlay: PlayerStat[];
    teamPenaltyKill: PlayerStat[];
  };
}

export function LeagueQuickStats({ stats }: LeagueQuickStatsProps) {
  const [selectedStat, setSelectedStat] = useState<StatCategory>('Points');

  const getStatsForCategory = (category: StatCategory) => {
    switch (category) {
      case 'Points':
        return stats.points;
      case 'Goals':
        return stats.goals;
      case 'Assists':
        return stats.assists;
      case '+/-':
        return stats.plusMinus;
      case 'SV%':
        return stats.savePercentage;
      case 'GAA':
        return stats.gaa;
      case 'Wins':
        return stats.teamWins;
      case 'PP%':
        return stats.teamPowerPlay;
      case 'PK%':
        return stats.teamPenaltyKill;
    }
  };

  const formatValue = (value: number, category: StatCategory) => {
    if (category === 'SV%' || category === 'PP%' || category === 'PK%') {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (category === 'GAA') {
      return value.toFixed(2);
    }
    if (category === '+/-' && value > 0) {
      return `+${value}`;
    }
    return value.toString();
  };

  const isTeamStat = (category: StatCategory) => {
    return ['Wins', 'PP%', 'PK%'].includes(category);
  };

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
        {getStatsForCategory(selectedStat).map((stat, index) => (
          <div
            key={stat.id}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-gray-400 w-6">{index + 1}</span>
              <div>
                {isTeamStat(selectedStat) ? (
                  <Link href={`/leagues/${stat.teamIdentifier}`} className="hover:text-blue-400">
                    {stat.name}
                  </Link>
                ) : (
                  <Link href={`/users/${stat.id}`} className="hover:text-blue-400">
                    {stat.gamertag}
                  </Link>
                )}
                {!isTeamStat(selectedStat) && (
                  <div className="text-xs text-gray-500">{stat.teamIdentifier}</div>
                )}
              </div>
            </div>
            <span className="font-mono">{formatValue(stat.value, selectedStat)}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 
