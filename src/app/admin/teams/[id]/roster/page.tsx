'use client';

import { useParams, useRouter } from 'next/navigation';
import { Nav } from '@/components/nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { NHLTeam, AHLTeam, ECHLTeam, CHLTeam } from '@/lib/teams/types';

interface Player {
  id: string;
  name: string;
  position: string;
  gamertag: string;
  contract: {
    amount: number;
  };
  stats: {
    gamesPlayed: number;
    goals: number;
    assists: number;
    plusMinus: number;
    saves?: number;
    goalsAgainst?: number;
  };
}

interface Team {
  id: string;
  officialName: string;
  teamIdentifier: string;
  tier: {
    name: string;
    salaryCap: number;
  };
  roster: {
    forwards: Player[];
    defense: Player[];
    goalies: Player[];
  };
}

type LeagueTeam = NHLTeam | AHLTeam | ECHLTeam | CHLTeam;

function PlayerCard({
  player,
  onRemove,
}: {
  player: Player;
  onRemove: (playerId: string) => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-gray-800/50 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn('font-semibold bg-black/30', {
              'text-red-400 border-red-400/30': player.position === 'C',
              'text-green-400 border-green-400/30': player.position === 'LW',
              'text-blue-400 border-blue-400/30': player.position === 'RW',
              'text-teal-400 border-teal-400/30': player.position === 'LD',
              'text-yellow-400 border-yellow-400/30': player.position === 'RD',
              'text-purple-400 border-purple-400/30': player.position === 'G',
            })}
          >
            {player.position}
          </Badge>
          <div>
            <p className="font-medium">{player.name}</p>
            <p className="text-sm text-gray-400">{player.gamertag}</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">${player.contract.amount.toLocaleString()}</div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center mb-4">
        <div className="p-2 rounded-lg bg-black/20">
          <div className="text-xs text-muted-foreground">GP</div>
          <div className="font-medium">{player.stats.gamesPlayed}</div>
        </div>
        {player.position === 'G' ? (
          <>
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-xs text-muted-foreground">Saves</div>
              <div className="font-medium">{player.stats.saves}</div>
            </div>
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-xs text-muted-foreground">GA</div>
              <div className="font-medium">{player.stats.goalsAgainst}</div>
            </div>
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-xs text-muted-foreground">SV%</div>
              <div className="font-medium">
                {player.stats.saves && player.stats.goalsAgainst
                  ? (
                      (player.stats.saves / (player.stats.saves + player.stats.goalsAgainst)) *
                      100
                    ).toFixed(1)
                  : '0.0'}
                %
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-xs text-muted-foreground">G</div>
              <div className="font-medium">{player.stats.goals}</div>
            </div>
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-xs text-muted-foreground">A</div>
              <div className="font-medium">{player.stats.assists}</div>
            </div>
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-xs text-muted-foreground">+/-</div>
              <div
                className={cn('font-medium', {
                  'text-green-500': player.stats.plusMinus > 0,
                  'text-red-500': player.stats.plusMinus < 0,
                })}
              >
                {player.stats.plusMinus > 0 ? `+${player.stats.plusMinus}` : player.stats.plusMinus}
              </div>
            </div>
          </>
        )}
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="w-full">
            Remove from Team
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Player from Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {player.name} from the team? They will return to free
              agency.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onRemove(player.id)}>Remove Player</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function TeamRosterPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  // Get team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/teams/${id}/roster`);
        if (!response.ok) throw new Error('Failed to fetch team roster');
        const data = await response.json();
        setTeam(data.team);
      } catch (error) {
        console.error('Error fetching team roster:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team roster',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [id, toast]);

  const handleRemovePlayer = async (playerId: string) => {
    try {
      const response = await fetch(`/api/admin/teams/${id}/roster/remove-player`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove player');
      }

      toast({
        title: 'Success',
        description: 'Player removed from team successfully',
      });

      // Refresh team data
      const teamResponse = await fetch(`/api/admin/teams/${id}/roster`);
      if (teamResponse.ok) {
        const data = await teamResponse.json();
        setTeam(data.team);
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove player',
        variant: 'destructive',
      });
    }
  };

  // Get team colors
  const teamData = team?.tier.name
    ? (() => {
        switch (team.tier.name.toLowerCase()) {
          case 'nhl':
            return NHL_TEAMS.find((t) => t.id === team.teamIdentifier.toLowerCase()) as
              | LeagueTeam
              | undefined;
          case 'ahl':
            return AHL_TEAMS.find((t) => t.id === team.teamIdentifier.toLowerCase()) as
              | LeagueTeam
              | undefined;
          case 'echl':
            return ECHL_TEAMS.find((t) => t.id === team.teamIdentifier.toLowerCase()) as
              | LeagueTeam
              | undefined;
          case 'chl':
            return CHL_TEAMS.find((t) => t.id === team.teamIdentifier.toLowerCase()) as
              | LeagueTeam
              | undefined;
          default:
            return undefined;
        }
      })()
    : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="container mx-auto py-6">
          <Skeleton className="h-[600px] w-full" />
        </main>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="container mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  const totalSalary = [
    ...team.roster.forwards,
    ...team.roster.defense,
    ...team.roster.goalies,
  ].reduce((sum, player) => sum + player.contract.amount, 0);

  const style =
    teamData && 'colors' in teamData
      ? {
          background: `linear-gradient(to bottom right, ${teamData.colors.primary}20, ${teamData.colors.secondary}30)`,
          borderLeft: `4px solid ${teamData.colors.primary}`,
        }
      : {};

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto py-6">
        <Card className="border-0 shadow-2xl" style={style}>
          <CardHeader>
            <CardTitle className="text-2xl">
              {teamData && 'name' in teamData ? teamData.name : team.officialName} Roster Management
            </CardTitle>
            <CardDescription>
              <div className="flex items-center gap-4 mt-2">
                <div
                  className={cn('text-lg', {
                    'text-green-500': totalSalary <= team.tier.salaryCap,
                    'text-red-500': totalSalary > team.tier.salaryCap,
                  })}
                >
                  Salary: ${totalSalary.toLocaleString()} / ${team.tier.salaryCap.toLocaleString()}
                </div>
                <div className="text-lg">
                  Players:{' '}
                  {team.roster.forwards.length +
                    team.roster.defense.length +
                    team.roster.goalies.length}{' '}
                  / 17
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Forwards */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Forwards ({team.roster.forwards.length}/9)
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {team.roster.forwards.map((player) => (
                  <PlayerCard key={player.id} player={player} onRemove={handleRemovePlayer} />
                ))}
              </div>
            </div>

            {/* Defense */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Defense ({team.roster.defense.length}/6)
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {team.roster.defense.map((player) => (
                  <PlayerCard key={player.id} player={player} onRemove={handleRemovePlayer} />
                ))}
              </div>
            </div>

            {/* Goalies */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Goalies ({team.roster.goalies.length}/2)
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {team.roster.goalies.map((player) => (
                  <PlayerCard key={player.id} player={player} onRemove={handleRemovePlayer} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
