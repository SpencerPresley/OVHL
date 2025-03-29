'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

interface Team {
  id: string;
  officialName: string;
  teamIdentifier: string;
  eaClubId: string;
  eaClubName: string;
  nhlAffiliate?: { officialName: string };
  ahlAffiliate?: { officialName: string };
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState<string | boolean>(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [latestSeasonNum, setLatestSeasonNum] = useState<number | null>(null);
  const router = useRouter();
  const { toast: useToastToast } = useToast();

  const makeApiCall = useCallback(
    async (
      endpoint: string,
      method: string = 'POST',
      body: object | null = null,
      loadingKey: string,
      successMessage: string,
      errorMessage: string
    ) => {
      setIsLoading(loadingKey);
      try {
        const options: RequestInit = { method };
        if (body) {
          options.headers = { 'Content-Type': 'application/json' };
          options.body = JSON.stringify(body);
        }
        const response = await fetch(endpoint, options);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || errorMessage);
        }

        const data = await response.json().catch(() => ({}));

        useToastToast({
          title: 'Success',
          description: data.message || successMessage,
        });
        router.refresh();
        return true;
      } catch (error) {
        console.error(`Error during ${loadingKey}:`, error);
        useToastToast({
          title: 'Error',
          description: error instanceof Error ? error.message : errorMessage,
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, useToastToast]
  );

  useEffect(() => {
    const fetchTeamsForEA = async () => {
      try {
        const response = await fetch('/api/admin/teams');
        if (response.ok) {
          const data = await response.json();
          setTeams(data.teams || []);
        } else {
          console.error("Failed to fetch teams for EA Club ID management");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeamsForEA();
  }, []);

  useEffect(() => {
    const fetchLatestSeason = async () => {
      try {
        setIsLoading('fetchSeason');
        const response = await fetch('/api/seasons/latest');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch latest season info');
        }
        const data = await response.json();
        setLatestSeasonNum(data.season?.seasonNumber || 0);
      } catch (error) {
        console.error("Error fetching latest season:", error);
        toast.error((error as Error).message || 'Could not load latest season number.');
        setLatestSeasonNum(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestSeason();
  }, []);

  const handleInitialSetup = async () => {
    await makeApiCall(
      '/api/admin/setup/teams',
      'POST',
      null,
      'initialSetup',
      'Initial leagues and teams setup/verified successfully!',
      'Failed to perform initial setup. Check console for details.'
    );
  };

  const updateEaClubId = async (teamId: string, eaClubId: string, eaClubName: string) => {
    await makeApiCall(
      `/api/admin/teams/${teamId}`,
      'PATCH',
      { eaClubId, eaClubName },
      `eaUpdate-${teamId}`,
      `Updated EA Club details for team ${teamId}.`,
      `Failed to update EA Club ID for team ${teamId}.`
    );
  };

  const handleCreateNextSeason = async () => {
    if (latestSeasonNum === null) {
      toast.warning("Still loading latest season info, please wait.");
      return;
    }

    const nextSeasonNum = latestSeasonNum + 1;
    const requestBody = { seasonNumber: nextSeasonNum };

    return await makeApiCall(
      '/api/admin/seasons',
      'POST',
      requestBody,
      'createSeason',
      `Season ${nextSeasonNum} created successfully!`,
      'Failed to create next season.'
    );
  };

  const handleCreateTestUsersPlayers = async () => {
    return await makeApiCall(
      '/api/admin/seasons/players',
      'POST',
      null,
      'createPlayers',
      'Test users and player seasons created successfully!',
      'Failed to create test users/players.'
    );
  };

  const handleAssignPlayers = async () => {
    return await makeApiCall(
      '/api/admin/assign-test-players',
      'POST',
      null,
      'assignPlayers',
      'Players assigned to teams successfully!',
      'Failed to assign players to teams.'
    );
  };

  const handleCreateMatches = async () => {
    return await makeApiCall(
      '/api/admin/create-test-matches',
      'POST',
      null,
      'createMatches',
      'Test matches generated successfully!',
      'Failed to generate test matches.'
    );
  };

  const handleGenerateAllTestData = async () => {
    setIsLoading('allTestData');
    toast({ title: 'Starting Test Data Generation', description: 'This may take a while...' });

    const steps = [
      { func: handleCreateNextSeason, name: 'Create Next Season' },
      { func: handleCreateTestUsersPlayers, name: 'Create Test Users & Players' },
      { func: handleAssignPlayers, name: 'Assign Players to Teams' },
      { func: handleCreateMatches, name: 'Generate Test Matches' },
    ];

    let success = true;
    for (const step of steps) {
      toast({ title: 'Running Step', description: `Starting: ${step.name}` });
      const stepSuccess = await step.func();
      if (!stepSuccess) {
        toast({
          title: 'Step Failed',
          description: `${step.name} failed. Aborting remaining steps.`,
          variant: 'destructive',
        });
        success = false;
        break;
      }
      toast({ title: 'Step Complete', description: `${step.name} completed successfully.` });
    }

    if (success) {
      toast({ title: 'Complete', description: 'All test data generation steps completed.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Initial System Setup</CardTitle>
            <CardDescription>
              Initialize base leagues and teams if they don't exist.
              <strong className="block text-yellow-500 mt-1">Run this only once!</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleInitialSetup}
              disabled={!!isLoading}
              className="w-full"
            >
              {isLoading === 'initialSetup' ? 'Initializing...' : 'Initialize Leagues & Teams'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Test Data Generation (Latest Season)</CardTitle>
            <CardDescription>
              Populate the most recent season with data. Run steps individually or all at once. Assumes initial setup is complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCreateNextSeason}
              disabled={!!isLoading}
            >
              {isLoading === 'createSeason' ? 'Creating Season...' : '1. Create Next Season'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCreateTestUsersPlayers}
              disabled={!!isLoading}
            >
              {isLoading === 'createPlayers' ? 'Creating Players...' : '2. Create Test Users & Players'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAssignPlayers}
              disabled={!!isLoading}
            >
              {isLoading === 'assignPlayers' ? 'Assigning Players...' : '3. Assign Players to Teams'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCreateMatches}
              disabled={!!isLoading}
            >
              {isLoading === 'createMatches' ? 'Generating Matches...' : '4. Generate Test Matches'}
            </Button>

            <hr className="my-4 border-gray-600" />

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleGenerateAllTestData}
              disabled={!!isLoading}
            >
              {isLoading === 'allTestData' ? 'Generating All Data...' : 'Generate All Test Data for Latest Season'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bidding Management</CardTitle>
            <CardDescription>
              Manage league bidding periods and control the bidding process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/bidding" passHref>
              <Button className="w-full" disabled={!!isLoading}>Manage Bidding</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {['NHL', 'AHL', 'ECHL', 'CHL'].map((league) => (
          <Card key={league}>
            <CardHeader>
              <CardTitle>{league} Management</CardTitle>
              <CardDescription>
                Manage {league} team staff & rosters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => router.push(`/admin/leagues/${league.toLowerCase()}/management`)}
                disabled={!!isLoading}
              >
                Manage Staff
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => router.push(`/admin/leagues/${league.toLowerCase()}/roster`)}
                disabled={!!isLoading}
              >
                Manage Roster
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>EA Club ID Management</CardTitle>
          <CardDescription>
            Update EA Club IDs and names for each team. (Ensure teams are fetched correctly above)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {teams.length === 0 && <p className="text-gray-500">No teams found or still loading...</p>}
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{team.officialName}</h3>
                  <p className="text-sm text-gray-500">{team.teamIdentifier}</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="EA Club ID"
                    defaultValue={team.eaClubId}
                    data-team-id={team.id}
                    data-field="id"
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="EA Club Name"
                    defaultValue={team.eaClubName}
                    data-team-id={team.id}
                    data-field="name"
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button
                    onClick={() => {
                      const idInput = document.querySelector(
                        `input[data-team-id="${team.id}"][data-field="id"]`
                      ) as HTMLInputElement;
                      const nameInput = document.querySelector(
                        `input[data-team-id="${team.id}"][data-field="name"]`
                      ) as HTMLInputElement;
                      if (idInput && nameInput) {
                        updateEaClubId(team.id, idInput.value, nameInput.value);
                      }
                    }}
                    disabled={!!isLoading}
                  >
                    {isLoading === `eaUpdate-${team.id}` ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
