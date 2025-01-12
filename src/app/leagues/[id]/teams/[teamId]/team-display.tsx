"use client";

import { Nav } from "@/components/nav";
import { LeagueNav } from "@/components/league-nav";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { System } from "@prisma/client";
import { POSITION_COLORS } from "@/lib/constants";

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface PlayerCard {
  id: string;
  name: string;
  position: string;
  system: System;
  gamertag: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
}

interface TeamDisplayProps {
  league: League;
  team: any;
  teamSeason: any;
}

export function TeamDisplay({ league, team, teamSeason }: TeamDisplayProps) {
  // Process players into position groups
  const players = teamSeason.players.map((ps: any) => ({
    id: ps.playerSeason.player.id,
    name: ps.playerSeason.player.name,
    position: ps.playerSeason.position,
    system: ps.playerSeason.player.activeSystem,
    gamertag: ps.playerSeason.player.gamertags[0]?.gamertag || ps.playerSeason.player.name,
    gamesPlayed: ps.gamesPlayed,
    goals: ps.goals,
    assists: ps.assists,
    points: ps.goals + ps.assists,
    plusMinus: ps.plusMinus,
  }));

  console.log("All available colors:", POSITION_COLORS);
  console.log("All players with positions:", players.map((p: PlayerCard) => ({ name: p.name, position: p.position })));

  const forwards = players.filter((p: PlayerCard) => ["C", "LW", "RW"].includes(p.position));
  const defense = players.filter((p: PlayerCard) => ["LD", "RD"].includes(p.position));
  const goalies = players.filter((p: PlayerCard) => p.position === "G");

  console.log("Forwards:", forwards.map((p: PlayerCard) => ({ name: p.name, position: p.position })));
  console.log("Defense:", defense.map((p: PlayerCard) => ({ name: p.name, position: p.position })));
  console.log("Goalies:", goalies.map((p: PlayerCard) => ({ name: p.name, position: p.position })));

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'C': return 'bg-red-500';
      case 'LW': return 'bg-green-500';
      case 'RW': return 'bg-blue-500';
      case 'LD': return 'bg-teal-500';
      case 'RD': return 'bg-yellow-500';
      case 'G': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const teamRecord = `${teamSeason.wins}-${teamSeason.losses}-${teamSeason.otLosses}`;
  const points = (teamSeason.wins * 2) + teamSeason.otLosses;

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
            <div>
              <h1 className="text-4xl font-bold text-white">
                {team.officialName}
              </h1>
              <p className="text-xl text-white/80">
                Record: {teamRecord} ({points} pts)
              </p>
            </div>
          </div>
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* Roster Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Forwards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Forwards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forwards.map((player: PlayerCard) => (
              <Card key={player.id} className="card-gradient card-hover rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{player.name}</span>
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-xl text-white min-w-[48px] text-center inline-block ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {player.system}: <Link href={`/users/${player.id}`} className="hover:underline">{player.gamertag}</Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Goals</p>
                      <p className="text-lg font-bold">{player.goals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assists</p>
                      <p className="text-lg font-bold">{player.assists}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Points</p>
                      <p className="text-lg font-bold">{player.points}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">+/-</p>
                      <p className={`text-lg font-bold ${player.plusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Defense */}
        <Separator className="my-8" />
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Defense</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defense.map((player: PlayerCard) => (
              <Card key={player.id} className="card-gradient card-hover rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{player.name}</span>
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-xl text-white min-w-[48px] text-center inline-block ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {player.system}: <Link href={`/users/${player.id}`} className="hover:underline">{player.gamertag}</Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Goals</p>
                      <p className="text-lg font-bold">{player.goals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assists</p>
                      <p className="text-lg font-bold">{player.assists}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Points</p>
                      <p className="text-lg font-bold">{player.points}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">+/-</p>
                      <p className={`text-lg font-bold ${player.plusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Goalies */}
        <Separator className="my-8" />
        <div>
          <h2 className="text-2xl font-bold mb-4">Goalies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goalies.map((player: PlayerCard) => (
              <Card key={player.id} className="card-gradient card-hover rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{player.name}</span>
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-xl text-white min-w-[48px] text-center inline-block ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {player.system}: <Link href={`/users/${player.id}`} className="hover:underline">{player.gamertag}</Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Games Played</p>
                      <p className="text-lg font-bold">{player.gamesPlayed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assists</p>
                      <p className="text-lg font-bold">{player.assists}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 