'use client';

import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { System, TeamManagementRole } from '@prisma/client';
import { POSITION_COLORS } from '@/lib/constants';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface Manager {
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
  managers: Manager[];
}

interface PlayerSeasonData {
  playerSeason: {
    player: {
      id: string;
      name: string;
      activeSystem: System;
      gamertags: {
        gamertag: string;
      }[];
      user?: {
        id: string;
      };
    };
    position: string;
    contract: {
      amount: number;
    };
  };
  gamesPlayed: number;
  goals: number;
  assists: number;
  plusMinus: number;
}

interface TeamSeason {
  players: PlayerSeasonData[];
  tier: {
    salaryCap: number;
  };
  wins: number;
  losses: number;
  otLosses: number;
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
  contract: {
    amount: number;
  };
  isManager: boolean;
}

interface TeamDisplayProps {
  league: League;
  team: Team;
  teamSeason: TeamSeason;
  managers: Manager[];
}

export function TeamDisplay({ league, team, teamSeason, managers }: TeamDisplayProps) {
  // Process players into position groups
  const players = teamSeason.players.map((ps: PlayerSeasonData) => {
    const manager = managers.find((m: Manager) => m.user.id === ps.playerSeason.player.user?.id);

    return {
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
      contract: ps.playerSeason.contract,
      isManager: !!manager,
    };
  });

  console.log('All available colors:', POSITION_COLORS);
  console.log(
    'All players with positions:',
    players.map((p: PlayerCard) => ({ name: p.name, position: p.position }))
  );

  const forwards = players.filter((p: PlayerCard) => ['C', 'LW', 'RW'].includes(p.position));
  const defense = players.filter((p: PlayerCard) => ['LD', 'RD'].includes(p.position));
  const goalies = players.filter((p: PlayerCard) => p.position === 'G');

  console.log(
    'Forwards:',
    forwards.map((p: PlayerCard) => ({ name: p.name, position: p.position }))
  );
  console.log(
    'Defense:',
    defense.map((p: PlayerCard) => ({ name: p.name, position: p.position }))
  );
  console.log(
    'Goalies:',
    goalies.map((p: PlayerCard) => ({ name: p.name, position: p.position }))
  );

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'C':
        return 'bg-red-500';
      case 'LW':
        return 'bg-green-500';
      case 'RW':
        return 'bg-blue-500';
      case 'LD':
        return 'bg-teal-500';
      case 'RD':
        return 'bg-yellow-500';
      case 'G':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const teamRecord = `${teamSeason.wins}-${teamSeason.losses}-${teamSeason.otLosses}`;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const points = teamSeason.wins * 2 + teamSeason.otLosses;

  const totalSalary = players.reduce((total, player) => total + player.contract.amount, 0);
  const salaryCap = teamSeason.tier?.salaryCap ?? 0;
  let salaryColor = 'text-white';
  if (totalSalary > salaryCap) {
    salaryColor = 'text-red-500';
  } else if (totalSalary === salaryCap) {
    salaryColor = 'text-green-500';
  }

  // Debug log for salary data
  console.log('Salary Data:', {
    totalSalary,
    salaryCap,
    tier: teamSeason.tier,
    players: players.map((p) => ({
      name: p.name,
      contractAmount: p.contract.amount,
    })),
  });

  return (
    <div className="min-h-screen">
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
              <h1 className="text-4xl font-bold text-white">{team.officialName}</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-xl text-white/80">
                  Record: {teamRecord} ({teamSeason.wins * 2 + teamSeason.otLosses} pts)
                </p>
                <p className={`text-xl ${salaryColor}`}>
                  Salary: ${totalSalary.toLocaleString()} / ${salaryCap.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* Team Management */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 card-gradient card-hover">
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>Current team management staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['OWNER', 'GM', 'AGM', 'PAGM'].map((role) => {
                const manager = managers.find((m) => m.role === role);
                const isHigherRole = ['OWNER', 'GM', 'AGM'].includes(role);

                return (
                  <div
                    key={role}
                    className={`p-4 rounded-lg ${isHigherRole ? 'bg-gray-800/50' : 'bg-gray-700/30'} border border-white/10`}
                  >
                    <h3 className="font-semibold mb-2">{role}</h3>
                    {manager ? (
                      <Link
                        href={`/users/${manager.user.id}`}
                        className="text-sm hover:text-blue-400"
                      >
                        {manager.user.name ||
                          manager.user.username ||
                          manager.user.player?.gamertags[0]?.gamertag ||
                          manager.user.email}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">Vacant</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Roster Content */}
        {/* Forwards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Forwards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forwards.map((player: PlayerCard) => (
              <Card key={player.id} className="card-gradient card-hover rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{player.name}</span>
                    <span
                      className={`text-sm font-bold px-3 py-1.5 rounded-xl text-white min-w-[48px] text-center inline-block ${getPositionColor(player.position)}`}
                    >
                      {player.position}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {player.system}:{' '}
                    <Link href={`/users/${player.id}`} className="hover:underline">
                      {player.gamertag}
                    </Link>
                    <div className="text-sm text-gray-400 mt-1">
                      Contract: ${player.contract.amount.toLocaleString()}
                      {player.isManager && ' (Management)'}
                    </div>
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
                      <p
                        className={`text-lg font-bold ${player.plusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
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
                    <span
                      className={`text-sm font-bold px-3 py-1.5 rounded-xl text-white min-w-[48px] text-center inline-block ${getPositionColor(player.position)}`}
                    >
                      {player.position}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {player.system}:{' '}
                    <Link href={`/users/${player.id}`} className="hover:underline">
                      {player.gamertag}
                    </Link>
                    <div className="text-sm text-gray-400 mt-1">
                      Contract: ${player.contract.amount.toLocaleString()}
                      {player.isManager && ' (Management)'}
                    </div>
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
                      <p
                        className={`text-lg font-bold ${player.plusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
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
                    <span
                      className={`text-sm font-bold px-3 py-1.5 rounded-xl text-white min-w-[48px] text-center inline-block ${getPositionColor(player.position)}`}
                    >
                      {player.position}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {player.system}:{' '}
                    <Link href={`/users/${player.id}`} className="hover:underline">
                      {player.gamertag}
                    </Link>
                    <div className="text-sm text-gray-400 mt-1">
                      Contract: ${player.contract.amount.toLocaleString()}
                      {player.isManager && ' (Management)'}
                    </div>
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
