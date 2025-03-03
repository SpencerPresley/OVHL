'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserProfileProps {
  user: {
    id: string;
    email: string;
    player: {
      gamertags: {
        gamertag: string;
        createdAt: Date;
        playerId: string;
        system: 'PS' | 'XBOX';
      }[];
      seasons: {
        teamSeasons: {
          teamSeason: {
            team: {
              id: string;
              officialName: string;
              createdAt: Date;
              updatedAt: Date;
              ahlAffiliateId: string | null;
            };
            gamesPlayed?: number;
            goals?: number;
            assists?: number;
          };
        }[];
      }[];
    };
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const initials = user.email.charAt(0).toUpperCase();
  const currentGamertag = user.player.gamertags[0]?.gamertag || user.email;
  const currentSeason = user.player.seasons[0]; // We filtered for latest season
  const currentTeamSeason = currentSeason?.teamSeasons[0]?.teamSeason;
  const currentTeam = currentTeamSeason?.team;

  return (
    <div className="min-h-screen">

      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Player Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" alt={currentGamertag} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="text-center">
              <h2 className="text-xl font-medium">{currentGamertag}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            {currentTeam && (
              <div className="text-center">
                <h3 className="font-medium">Current Team</h3>
                <p>{currentTeam.officialName}</p>
              </div>
            )}

            {currentTeamSeason && (
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Games Played</p>
                  <p className="text-lg font-bold">{currentTeamSeason.gamesPlayed || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Goals</p>
                  <p className="text-lg font-bold">{currentTeamSeason.goals || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assists</p>
                  <p className="text-lg font-bold">{currentTeamSeason.assists || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Points</p>
                  <p className="text-lg font-bold">
                    {(currentTeamSeason.goals || 0) + (currentTeamSeason.assists || 0)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
