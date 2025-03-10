import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { System } from '@prisma/client';

interface PlayerCardProps {
  player: {
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
  };
  getPositionColor: (position: string) => string;
}

export function PlayerCard({ player, getPositionColor }: PlayerCardProps) {
  const isGoalie = player.position === 'G';

  return (
    <Card className="card-gradient card-hover rounded-xl">
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
        {isGoalie ? (
          // Goalie stats
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
        ) : (
          // Skater stats (forwards and defense)
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
        )}
      </CardContent>
    </Card>
  );
}
