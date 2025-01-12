"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      const response = await fetch("/api/admin/teams");
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
      const response = await fetch("/api/admin/setup/teams", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to setup teams");
      }
      
      alert("Teams setup successfully!");
      // Refresh the teams list
      router.refresh();
    } catch (error) {
      console.error("Error setting up teams:", error);
      alert("Failed to setup teams. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEaClubId = async (teamId: string, eaClubId: string, eaClubName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eaClubId, eaClubName }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update EA Club ID");
      }
      
      // Refresh the teams list
      router.refresh();
    } catch (error) {
      console.error("Error updating EA Club ID:", error);
      alert("Failed to update EA Club ID. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  async function createSeason(seasonId: string) {
    try {
      const response = await fetch("/api/admin/seasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seasonId }),
      });
      if (!response.ok) throw new Error("Failed to create season");
      alert("Season created successfully!");
    } catch (error) {
      console.error("Error creating season:", error);
      alert("Failed to create season");
    }
  }

  async function insertTestData() {
    try {
      const response = await fetch("/api/admin/test-data", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to insert test data");
      alert("Test data inserted successfully!");
    } catch (error) {
      console.error("Error inserting test data:", error);
      alert("Failed to insert test data");
    }
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
              Initialize all teams across NHL, AHL, ECHL, and CHL leagues.
              This only needs to be done once. After setup, you can update EA Club IDs below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={setupTeams} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Setting up..." : "Setup Teams"}
            </Button>
          </CardContent>
        </Card>

        {/* Season Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Season Management</CardTitle>
            <CardDescription>
              Create a new season and automatically set up all tiers and teams.
              Make sure all teams are set up first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Create New Season</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Season</DialogTitle>
                  <DialogDescription>
                    Enter the season ID (e.g., "2024" for the 2024 season)
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <input
                      id="seasonId"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter season ID..."
                      onChange={(e) => {
                        // Store in a data attribute for the create button
                        e.currentTarget.closest("div[role='dialog']")
                          ?.querySelector("button[data-action='create']")
                          ?.setAttribute("data-season-id", e.target.value);
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    data-action="create"
                    onClick={async (e) => {
                      const seasonId = e.currentTarget.getAttribute("data-season-id");
                      if (!seasonId) {
                        alert("Please enter a season ID");
                        return;
                      }
                      await createSeason(seasonId);
                      const dialogButton = e.currentTarget
                        .closest("div[role='dialog']")
                        ?.querySelector("button[data-state='open']") as HTMLButtonElement;
                      dialogButton?.click();
                    }}
                  >
                    Create Season
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              variant="secondary" 
              className="w-full"
              onClick={insertTestData}
            >
              Insert Test Data
            </Button>
          </CardContent>
        </Card>
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
                    <p className="text-xs text-gray-400">NHL Affiliate: {team.nhlAffiliate.officialName}</p>
                  )}
                  {team.ahlAffiliate && (
                    <p className="text-xs text-gray-400">AHL Affiliate: {team.ahlAffiliate.officialName}</p>
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
                      const idInput = document.querySelector(`input[data-team-id="${team.id}"][data-field="id"]`) as HTMLInputElement;
                      const nameInput = document.querySelector(`input[data-team-id="${team.id}"][data-field="name"]`) as HTMLInputElement;
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