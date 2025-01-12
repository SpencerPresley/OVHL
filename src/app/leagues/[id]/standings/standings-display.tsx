"use client";

import { Nav } from "@/components/nav";
import { LeagueNav } from "@/components/league-nav";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface TeamStats {
  teamId: string;
  teamName: string;
  teamIdentifier: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  powerplayGoals: number;
  powerplayOpportunities: number;
  powerplayPercentage: number;
  penaltyKillGoalsAgainst: number;
  penaltyKillOpportunities: number;
  penaltyKillPercentage: number;
}

interface StandingsData {
  tierName: string;
  teams: TeamStats[];
}

interface StandingsDisplayProps {
  league: League;
}

export function StandingsDisplay({ league }: StandingsDisplayProps) {
  const [standings, setStandings] = useState<StandingsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch(`/api/leagues/${league.id}/standings`);
        if (!response.ok) throw new Error("Failed to fetch standings");
        const data = await response.json();
        setStandings(data.standings);
      } catch (error) {
        console.error("Error fetching standings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandings();
  }, [league.id]);

  return (
    <div className="min-h-screen">
      <Nav />

      {/* League Banner */}
      <div className={`w-full ${league.bannerColor} py-8`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Image
              src={league.logo}
              alt={`${league.name} Logo`}
              width={80}
              height={80}
              className="object-contain"
            />
            <h1 className="text-4xl font-bold text-white">
              {league.name} Standings
            </h1>
          </div>
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* Standings Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div>Loading standings...</div>
        ) : (
          standings.map((tierStandings) => (
            <div key={tierStandings.tierName} className="mb-10">
              <h2 className="text-2xl font-bold mb-4">{tierStandings.tierName}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">GP</TableHead>
                    <TableHead className="text-right">W</TableHead>
                    <TableHead className="text-right">L</TableHead>
                    <TableHead className="text-right">OTL</TableHead>
                    <TableHead className="text-right">PTS</TableHead>
                    <TableHead className="text-right">GF</TableHead>
                    <TableHead className="text-right">GA</TableHead>
                    <TableHead className="text-right">DIFF</TableHead>
                    <TableHead className="text-right">PP%</TableHead>
                    <TableHead className="text-right">PK%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tierStandings.teams.map((team) => (
                    <TableRow key={team.teamId}>
                      <TableCell className="font-medium">
                        <div>
                          <span className="font-bold">{team.teamIdentifier}</span>
                          <span className="text-sm text-gray-500 ml-2">{team.teamName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{team.gamesPlayed}</TableCell>
                      <TableCell className="text-right">{team.wins}</TableCell>
                      <TableCell className="text-right">{team.losses}</TableCell>
                      <TableCell className="text-right">{team.otLosses}</TableCell>
                      <TableCell className="text-right font-bold">{team.points}</TableCell>
                      <TableCell className="text-right">{team.goalsFor}</TableCell>
                      <TableCell className="text-right">{team.goalsAgainst}</TableCell>
                      <TableCell className="text-right">{team.goalDifferential}</TableCell>
                      <TableCell className="text-right">{team.powerplayPercentage.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{team.penaltyKillPercentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 