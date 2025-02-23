'use client';

import { useParams, useRouter } from 'next/navigation';
import { Nav } from '@/components/nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FreeAgentsList } from './components/free-agents-list';
import { TeamsList } from './components/teams-list';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';

interface Player {
  id: string;
  name: string;
  position: string;
  gamertag: string;
  contract: {
    amount: number;
  };
  isInBidding: boolean;
}

interface Team {
  id: string;
  officialName: string;
  teamIdentifier: string;
  seasons: {
    tier: {
      name: string;
    };
  }[];
  roster: {
    forwards: number;
    defense: number;
    goalies: number;
  };
}

export default function LeagueRosterManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [freeAgents, setFreeAgents] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const leagueName = id?.toString().toUpperCase() || '';

  // Get league-specific team data
  const leagueTeams = useMemo(() => {
    switch (leagueName.toLowerCase()) {
      case 'nhl':
        return NHL_TEAMS;
      case 'ahl':
        return AHL_TEAMS;
      case 'echl':
        return ECHL_TEAMS;
      case 'chl':
        return CHL_TEAMS;
      default:
        return [];
    }
  }, [leagueName]);

  // Transform teams data with league-specific information
  const transformedTeams = useMemo(() => {
    return teams.map((team) => {
      const leagueTeamData = leagueTeams.find((t) => t.id === team.teamIdentifier.toLowerCase());
      return {
        ...team,
        officialName: leagueTeamData?.name || team.officialName,
        colors: leagueTeamData?.colors,
      };
    });
  }, [teams, leagueTeams]);

  // Fetch teams only once
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsResponse = await fetch('/api/admin/teams');
        if (!teamsResponse.ok) throw new Error('Failed to fetch teams');
        const teamsData = await teamsResponse.json();

        const filteredTeams = teamsData.teams.filter((team: Team) => {
          const currentLeague = team.seasons[0]?.tier.name;
          return currentLeague === leagueName;
        });
        setTeams(filteredTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast({
          title: 'Error',
          description: 'Failed to load teams',
          variant: 'destructive',
        });
      }
    };

    fetchTeams();
  }, [leagueName, toast]);

  // Fetch initial free agents
  useEffect(() => {
    const fetchFreeAgents = async () => {
      try {
        setLoading(true);
        const faResponse = await fetch(`/api/admin/free-agents?league=${leagueName}`);
        if (!faResponse.ok) throw new Error('Failed to fetch free agents');
        const faData = await faResponse.json();
        setFreeAgents(faData.players);
      } catch (error) {
        console.error('Error fetching free agents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load free agents',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFreeAgents();
  }, [leagueName, toast]);

  const handleAddToTeam = async (playerId: string, teamId: string) => {
    try {
      const response = await fetch('/api/admin/roster/add-player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          teamId,
          leagueId: leagueName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add player to team');
      }

      toast({
        title: 'Success',
        description: 'Player added to team successfully',
      });

      // Remove the player from the local state
      setFreeAgents((prev) => prev.filter((p) => p.id !== playerId));

      // Refresh teams to update roster counts
      const teamsResponse = await fetch('/api/admin/teams');
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        const filteredTeams = teamsData.teams.filter((team: Team) => {
          const currentLeague = team.seasons[0]?.tier.name;
          return currentLeague === leagueName;
        });
        setTeams(filteredTeams);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add player to team',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto py-6">
        <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
          <CardHeader>
            <CardTitle>{leagueName} Roster Management</CardTitle>
            <CardDescription className="text-gray-300">
              Manage team rosters and free agents for {leagueName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <FreeAgentsList
                freeAgents={freeAgents}
                teams={transformedTeams}
                onAddToTeam={handleAddToTeam}
                loading={loading}
              />
              <TeamsList
                teams={transformedTeams}
                leagueId={leagueName}
                onManageTeam={(teamId) => router.push(`/admin/teams/${teamId}/roster`)}
                loading={loading}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
