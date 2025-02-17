'use client';

import React from 'react';
import { Nav } from '@/components/nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserService, type UserProfileResponse, type FormattedUserProfile, type PlayerProfile } from '@/lib/services/user-service';

interface UserProfileViewProps {
  user: UserProfileResponse;
}

function isPlayerProfile(profile: FormattedUserProfile): profile is PlayerProfile {
  return profile.hasPlayer;
}

export function UserProfileView({ user }: UserProfileViewProps) {
  const profileData = UserService.formatUserProfileData(user);

  if (!isPlayerProfile(profileData)) {
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

  const { currentGamertag, initials, system, currentContract, careerStats, user: { player } } = profileData;

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
              <p className="text-gray-300">{system}</p>
              <p className="text-gray-300">Contract: ${currentContract.toLocaleString()}</p>
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
        {player.seasons.map((season, index) => (
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
