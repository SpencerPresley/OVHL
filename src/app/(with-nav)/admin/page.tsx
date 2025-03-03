'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Team {
  id: string;
  officialName: string;
  teamIdentifier: string;
  eaClubId: string;
  eaClubName: string;
  nhlAffiliate?: Team;
  ahlAffiliate?: Team;
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [seasonId, setSeasonId] = useState('');
  const router = useRouter();

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      const response = await fetch('/api/admin/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
      }
    };
    fetchTeams();
  }, []);

  const setupTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/setup/teams', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to setup teams');
      }

      alert('Teams setup successfully!');
      // Refresh the teams list
      router.refresh();
    } catch (error) {
      console.error('Error setting up teams:', error);
      alert('Failed to setup teams. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEaClubId = async (teamId: string, eaClubId: string, eaClubName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eaClubId, eaClubName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update EA Club ID');
      }

      // Refresh the teams list
      router.refresh();
    } catch (error) {
      console.error('Error updating EA Club ID:', error);
      alert('Failed to update EA Club ID. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  async function createSeason(seasonId: string) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seasonId }),
      });
      if (!response.ok) throw new Error('Failed to create season');
      alert('Season created successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error creating season:', error);
      alert('Failed to create season');
    } finally {
      setIsLoading(false);
    }
  }

  async function insertTestData() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/test-data', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to insert test data');
      alert('Test data inserted successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error inserting test data:', error);
      alert('Failed to insert test data');
    } finally {
      setIsLoading(false);
    }
  }

  async function createTestPlayers() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/test-data/players', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to create test players');
      alert('Test players created successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error creating test players:', error);
      alert('Failed to create test players');
    } finally {
      setIsLoading(false);
    }
  }

  async function createSeasonPlayers() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/seasons/players', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to create season players');
      const data = await response.json();
      alert(`Successfully created ${data.playersCreated} players for the current season!`);
      router.refresh();
    } catch (error) {
      console.error('Error creating season players:', error);
      alert('Failed to create season players');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateSeason() {
    if (!seasonId) {
      alert('Please enter a season ID');
      return;
    }
    await createSeason(seasonId);
    setSeasonDialogOpen(false);
    setSeasonId('');
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle>Initial Team Setup</CardTitle>
            <CardDescription>
              Initialize all teams across NHL, AHL, ECHL, and CHL leagues. This only needs to be
              done once. After setup, you can update EA Club IDs below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={setupTeams} disabled={isLoading} className="w-full">
              {isLoading ? 'Setting up...' : 'Setup Teams'}
            </Button>
          </CardContent>
        </Card>

        {/* Season Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Season Management</CardTitle>
            <CardDescription>
              Create a new season and automatically set up all tiers and teams. Make sure all teams
              are set up first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={seasonDialogOpen} onOpenChange={setSeasonDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Create New Season</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Season</DialogTitle>
                  <DialogDescription>
                    Enter the season ID (e.g., &ldquo;2024&rdquo; for the 2024 season)
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <input
                      id="seasonId"
                      value={seasonId}
                      onChange={(e) => setSeasonId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter season ID..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateSeason} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Season'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full"
              onClick={createSeasonPlayers}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Players...' : 'Create Season Players'}
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={insertTestData}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Test Data...' : 'Insert Test Data'}
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={createTestPlayers}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Players...' : 'Create Test Players'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* League Management Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {['NHL', 'AHL', 'ECHL', 'CHL'].map((league) => (
          <Card key={league}>
            <CardHeader>
              <CardTitle>{league} Management</CardTitle>
              <CardDescription>
                Manage {league} team staff positions (
                {league === 'NHL' || league === 'CHL' ? 'Owner, GM, AGM, PAGM' : 'GM, AGM, PAGM'})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => router.push(`/admin/leagues/${league.toLowerCase()}/management`)}
              >
                Manage Staff
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => router.push(`/admin/leagues/${league.toLowerCase()}/roster`)}
              >
                Manage Roster
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* EA Club ID Management */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>EA Club ID Management</CardTitle>
          <CardDescription>
            Update EA Club IDs and names for each team. These are required for stats tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{team.officialName}</h3>
                  <p className="text-sm text-gray-500">{team.teamIdentifier}</p>
                  {team.nhlAffiliate && (
                    <p className="text-xs text-gray-400">
                      NHL Affiliate: {team.nhlAffiliate.officialName}
                    </p>
                  )}
                  {team.ahlAffiliate && (
                    <p className="text-xs text-gray-400">
                      AHL Affiliate: {team.ahlAffiliate.officialName}
                    </p>
                  )}
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
                    disabled={isLoading}
                  >
                    Update
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
