'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Nav } from '@/components/nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TeamManagementRole } from '@prisma/client';
import { UserSearch } from '@/components/user-search';

interface Manager {
  id: string;
  role: TeamManagementRole;
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    player: {
      id: string;
      gamertags: {
        gamertag: string;
      }[];
    } | null;
  };
}

interface Team {
  id: string;
  officialName: string;
  seasons: {
    tier: {
      name: string;
    };
  }[];
}

export default function TeamManagementPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamManagementRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamAndManagers = async () => {
      try {
        // Fetch team details
        const teamResponse = await fetch(`/api/teams/${id}`);
        if (!teamResponse.ok) throw new Error('Failed to fetch team');
        const teamData = await teamResponse.json();
        setTeam(teamData.team);

        // Fetch team managers
        const managersResponse = await fetch(`/api/teams/${id}/managers`);
        if (!managersResponse.ok) throw new Error('Failed to fetch managers');
        const managersData = await managersResponse.json();
        setManagers(managersData.managers);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team management data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndManagers();
  }, [id, toast]);

  const handleAddManager = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: 'Error',
        description: 'Please select both a user and a role',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/teams/${id}/managers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add manager');
      }

      const { manager } = await response.json();
      setManagers([...managers, manager]);
      setSelectedUser(null);
      setSelectedRole(null);

      toast({
        title: 'Success',
        description: 'Team manager added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add team manager',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveManager = async (userId: string, role: TeamManagementRole) => {
    try {
      const response = await fetch(`/api/teams/${id}/managers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove manager');
      }

      setManagers(managers.filter((m) => !(m.user.id === userId && m.role === role)));

      toast({
        title: 'Success',
        description: 'Team manager removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove team manager',
        variant: 'destructive',
      });
    }
  };

  if (loading || !team) return null;

  const league = team.seasons[0]?.tier.name.toUpperCase();
  const availableRoles = Object.values(TeamManagementRole).filter((role) => {
    if (role === TeamManagementRole.OWNER) {
      return ['NHL', 'CHL'].includes(league);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Nav />
      <main className="container py-6">
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
            <CardHeader>
              <CardTitle>Team Management - {team.officialName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add Manager Form */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select User</label>
                    <UserSearch onSelect={setSelectedUser} teamId={team.id} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Role</label>
                    <Select onValueChange={(value) => setSelectedRole(value as TeamManagementRole)}>
                      <SelectTrigger className="bg-gray-800/50 border-white/10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddManager}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      Add Manager
                    </Button>
                  </div>
                </div>

                {/* Current Managers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Managers</h3>
                  <div className="grid gap-4">
                    {managers.map((manager) => (
                      <div
                        key={`${manager.user.id}-${manager.role}`}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-white/10"
                      >
                        <div>
                          <p className="font-medium">
                            {manager.user.name ||
                              manager.user.username ||
                              manager.user.player?.gamertags[0]?.gamertag ||
                              manager.user.email}
                          </p>
                          <p className="text-sm text-gray-400">{manager.role}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveManager(manager.user.id, manager.role)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 
