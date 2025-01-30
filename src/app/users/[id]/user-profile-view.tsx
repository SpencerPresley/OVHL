'use client';

import React from 'react';
import { Nav } from '@/components/nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface UserProfileViewProps {
  user: {
    id: string;
    email: string;
    player: {
      id: string;
      gamertags: {
        gamertag: string;
        createdAt: Date;
        playerId: string;
        system: 'PS' | 'XBOX';
      }[];
      seasons: {
        id: string;
        position: string;
        gamesPlayed: number | null;
        goals: number | null;
        assists: number | null;
        plusMinus: number | null;
        shots: number | null;
        hits: number | null;
        takeaways: number | null;
        giveaways: number | null;
        penaltyMinutes: number | null;
        saves: number | null;
        goalsAgainst: number | null;
        contract: {
          amount: number;
        } | null;
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
          gamesPlayed: number | null;
          goals: number | null;
          assists: number | null;
          plusMinus: number | null;
          shots: number | null;
          hits: number | null;
          takeaways: number | null;
          giveaways: number | null;
          penaltyMinutes: number | null;
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
  const careerStats = user.player.seasons.reduce(
    (totals, season) => {
      totals.gamesPlayed += season.gamesPlayed || 0;
      totals.goals += season.goals || 0;
      totals.assists += season.assists || 0;
      totals.points += (season.goals || 0) + (season.assists || 0);
      totals.plusMinus += season.plusMinus || 0;
      totals.shots += season.shots || 0;
      totals.hits += season.hits || 0;
      totals.takeaways += season.takeaways || 0;
      totals.giveaways += season.giveaways || 0;
      totals.penaltyMinutes += season.penaltyMinutes || 0;
      return totals;
    },
    {
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      points: 0,
      plusMinus: 0,
      shots: 0,
      hits: 0,
      takeaways: 0,
      giveaways: 0,
      penaltyMinutes: 0,
    }
  );

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
              <p className="text-gray-300">
                {user.player.gamertags[0]?.system || 'Unknown System'}
              </p>
              <p className="text-gray-300">
                Contract: ${(user.player.seasons[0]?.contract?.amount || 500000).toLocaleString()}
              </p>
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
              <CardTitle className="flex items-center justify-between">
                <span>Season Stats</span>
                <span className="text-sm bg-gray-700 px-3 py-1 rounded-lg text-white">
                  {season.position}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Total Season Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Total Season Stats</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg text-white">
                    <p className="text-sm text-gray-400">Games</p>
                    <p className="text-xl font-bold">{season.gamesPlayed || 0}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-white">
                    <p className="text-sm text-gray-400">Goals</p>
                    <p className="text-xl font-bold">{season.goals || 0}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-white">
                    <p className="text-sm text-gray-400">Assists</p>
                    <p className="text-xl font-bold">{season.assists || 0}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-white">
                    <p className="text-sm text-gray-400">Points</p>
                    <p className="text-xl font-bold">
                      {(season.goals || 0) + (season.assists || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-white">
                    <p className="text-sm text-gray-400">+/-</p>
                    <p className="text-xl font-bold">{season.plusMinus || 0}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-800 p-4 rounded-lg text-white">
                    <p className="text-sm text-gray-400">Shots</p>
                    <p className="text-xl font-bold">{season.shots || 0}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-white">
                    <p className="text-sm text-gray-400">Hits</p>
                    <p className="text-xl font-bold">{season.hits || 0}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-white">
                    <p className="text-sm text-gray-400">Takeaways</p>
                    <p className="text-xl font-bold">{season.takeaways || 0}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-white">
                    <p className="text-sm text-gray-400">PIM</p>
                    <p className="text-xl font-bold">{season.penaltyMinutes || 0}</p>
                  </div>
                </div>
              </div>

              {/* Per-Team Stats */}
              {season.teamSeasons.map((teamSeason, idx) => (
                <div key={idx} className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      <Link
                        href={`/leagues/${teamSeason.teamSeason.tier.name.toLowerCase()}/teams/${teamSeason.teamSeason.team.teamIdentifier}`}
                        className="hover:opacity-75"
                      >
                        {teamSeason.teamSeason.team.officialName}
                      </Link>
                    </h3>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg text-white">
                      <p className="text-sm text-gray-400">Games</p>
                      <p className="text-xl font-bold">{teamSeason.gamesPlayed || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-white">
                      <p className="text-sm text-gray-400">Goals</p>
                      <p className="text-xl font-bold">{teamSeason.goals || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-white">
                      <p className="text-sm text-gray-400">Assists</p>
                      <p className="text-xl font-bold">{teamSeason.assists || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-white">
                      <p className="text-sm text-gray-400">Points</p>
                      <p className="text-xl font-bold">
                        {(teamSeason.goals || 0) + (teamSeason.assists || 0)}
                      </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-white">
                      <p className="text-sm text-gray-400">+/-</p>
                      <p className="text-xl font-bold">{teamSeason.plusMinus || 0}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="bg-gray-800 p-4 rounded-lg text-white">
                      <p className="text-sm text-gray-400">Shots</p>
                      <p className="text-xl font-bold">{teamSeason.shots || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-white">
                      <p className="text-sm text-gray-400">Hits</p>
                      <p className="text-xl font-bold">{teamSeason.hits || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-white">
                      <p className="text-sm text-gray-400">Takeaways</p>
                      <p className="text-xl font-bold">{teamSeason.takeaways || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-white">
                      <p className="text-sm text-gray-400">PIM</p>
                      <p className="text-xl font-bold">{teamSeason.penaltyMinutes || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
