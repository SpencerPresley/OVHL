'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface Team {
  id: string;
  officialName: string;
  teamIdentifier: string;
  nhlAffiliate?: Team;
  ahlAffiliate?: Team;
  seasons: {
    tier: {
      name: string;
    };
  }[];
}

export default function LeagueManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const leagueName = id?.toString().toUpperCase() || '';

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/admin/teams');
        if (response.ok) {
          const data = await response.json();
          // Filter teams based on league
          const filteredTeams = data.teams.filter((team: Team) => {
            // Get the team's current league from its most recent season
            const currentLeagueShortName = team.seasons[0]?.leagueSeason?.league?.shortName;
            return currentLeagueShortName === leagueName;
          });
          setTeams(filteredTeams);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [leagueName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6">
        <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
          <CardHeader>
            <CardTitle>{leagueName} Team Management</CardTitle>
            <CardDescription className="text-gray-300">
              Manage team staff positions (
              {leagueName === 'NHL' || leagueName === 'CHL'
                ? 'Owner, GM, AGM, PAGM'
                : 'GM, AGM, PAGM'}
              ) for {leagueName} teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Card key={team.id} className="bg-gray-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">{team.officialName}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {team.teamIdentifier}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push(`/admin/teams/${team.id}/management`)}
                    >
                      Manage Staff
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
