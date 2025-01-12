"use client";

import React from "react";
import { Nav } from "@/components/nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface UserProfileViewProps {
  user: {
    id: string;
    email: string;
    player: {
      gamertags: {
        gamertag: string;
        createdAt: Date;
        playerId: string;
        system: "PS" | "XBOX";
      }[];
      seasons: {
        position: string;
        teamSeasons: {
          teamSeason: {
            team: {
              id: string;
              officialName: string;
              teamIdentifier: string;
              createdAt: Date;
              updatedAt: Date;
              ahlAffiliateId: string | null;
            };
            tier: {
              name: string;
            };
          };
          gamesPlayed?: number;
          goals?: number;
          assists?: number;
          plusMinus?: number;
          shots?: number;
          hits?: number;
          takeaways?: number;
          giveaways?: number;
          penaltyMinutes?: number;
        }[];
      }[];
    } | null;
  };
}

export function UserProfileView({ user }: UserProfileViewProps) {
  if (!user.player) {
    return (
      <div>
        <Nav />
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">User</h2>
                  <p className="text-gray-500">No player data available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentGamertag = user.player.gamertags[0]?.gamertag || 'Unknown Player';
  const initials = currentGamertag.charAt(0).toUpperCase();

  // Calculate career totals
  const careerStats = user.player.seasons.reduce((totals, season) => {
    season.teamSeasons.forEach(teamSeason => {
      totals.gamesPlayed += teamSeason.gamesPlayed || 0;
      totals.goals += teamSeason.goals || 0;
      totals.assists += teamSeason.assists || 0;
      totals.points += (teamSeason.goals || 0) + (teamSeason.assists || 0);
      totals.plusMinus += teamSeason.plusMinus || 0;
      totals.shots += teamSeason.shots || 0;
      totals.hits += teamSeason.hits || 0;
      totals.takeaways += teamSeason.takeaways || 0;
      totals.giveaways += teamSeason.giveaways || 0;
      totals.penaltyMinutes += teamSeason.penaltyMinutes || 0;
    });
    return totals;
  }, {
    gamesPlayed: 0,
    goals: 0,
    assists: 0,
    points: 0,
    plusMinus: 0,
    shots: 0,
    hits: 0,
    takeaways: 0,
    giveaways: 0,
    penaltyMinutes: 0
  });

  return (
    <div>
      <Nav />
      <div className="container mx-auto py-8">
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{currentGamertag}</h1>
              <p className="text-gray-300">{user.player.gamertags[0]?.system || 'Unknown System'}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div>
              <p className="text-gray-400">Games Played</p>
              <p className="text-2xl font-bold">{careerStats.gamesPlayed}</p>
            </div>
            <div>
              <p className="text-gray-400">Goals</p>
              <p className="text-2xl font-bold">{careerStats.goals}</p>
            </div>
            <div>
              <p className="text-gray-400">Points</p>
              <p className="text-2xl font-bold">{careerStats.points}</p>
            </div>
            <div>
              <p className="text-gray-400">+/-</p>
              <p className="text-2xl font-bold">{careerStats.plusMinus}</p>
            </div>
          </div>
        </div>

        {/* Season Stats */}
        {user.player.seasons.map((season, index) => (
          <Card key={index} className="mb-4 card-gradient card-hover">
            <CardHeader>
              <CardTitle>
                {season.teamSeasons.map((teamSeason, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <Link 
                      href={`/leagues/${teamSeason.teamSeason.tier.name.toLowerCase()}/teams/${teamSeason.teamSeason.team.teamIdentifier}`}
                      className="hover:opacity-75"
                    >
                      {teamSeason.teamSeason.team.officialName}
                    </Link>
                    <span className="text-sm bg-gray-700 px-3 py-1 rounded-lg text-white">
                      {season.position}
                    </span>
                  </div>
                ))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-white">
                  <p className="text-sm text-gray-400">Games</p>
                  <p className="text-xl font-bold">{season.teamSeasons[0]?.gamesPlayed || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-white">
                  <p className="text-sm text-gray-400">Goals</p>
                  <p className="text-xl font-bold">{season.teamSeasons[0]?.goals || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-white">
                  <p className="text-sm text-gray-400">Assists</p>
                  <p className="text-xl font-bold">{season.teamSeasons[0]?.assists || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-white">
                  <p className="text-sm text-gray-400">Points</p>
                  <p className="text-xl font-bold">
                    {(season.teamSeasons[0]?.goals || 0) + (season.teamSeasons[0]?.assists || 0)}
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-white">
                  <p className="text-sm text-gray-400">+/-</p>
                  <p className="text-xl font-bold">{season.teamSeasons[0]?.plusMinus || 0}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-800 p-4 rounded-lg text-white">
                  <p className="text-sm text-gray-400">Shots</p>
                  <p className="text-xl font-bold">{season.teamSeasons[0]?.shots || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-white">
                  <p className="text-sm text-gray-400">Hits</p>
                  <p className="text-xl font-bold">{season.teamSeasons[0]?.hits || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-white">
                  <p className="text-sm text-gray-400">Takeaways</p>
                  <p className="text-xl font-bold">{season.teamSeasons[0]?.takeaways || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-white">
                  <p className="text-sm text-gray-400">PIM</p>
                  <p className="text-xl font-bold">{season.teamSeasons[0]?.penaltyMinutes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Career Totals */}
        <Card className="mt-8 card-gradient card-hover">
          <CardHeader>
            <CardTitle>Career Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg text-white">
                <p className="text-sm text-gray-400">Games</p>
                <p className="text-xl font-bold">{careerStats.gamesPlayed}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-white">
                <p className="text-sm text-gray-400">Goals</p>
                <p className="text-xl font-bold">{careerStats.goals}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-white">
                <p className="text-sm text-gray-400">Assists</p>
                <p className="text-xl font-bold">{careerStats.assists}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-white">
                <p className="text-sm text-gray-400">Points</p>
                <p className="text-xl font-bold">{careerStats.points}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-white">
                <p className="text-sm text-gray-400">+/-</p>
                <p className="text-xl font-bold">{careerStats.plusMinus}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-800 p-4 rounded-lg text-white">
                <p className="text-sm text-gray-400">Shots</p>
                <p className="text-xl font-bold">{careerStats.shots}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-white">
                <p className="text-sm text-gray-400">Hits</p>
                <p className="text-xl font-bold">{careerStats.hits}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-white">
                <p className="text-sm text-gray-400">Takeaways</p>
                <p className="text-xl font-bold">{careerStats.takeaways}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-white">
                <p className="text-sm text-gray-400">PIM</p>
                <p className="text-xl font-bold">{careerStats.penaltyMinutes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 