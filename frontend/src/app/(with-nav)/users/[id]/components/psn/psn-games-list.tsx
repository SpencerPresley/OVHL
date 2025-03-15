'use client';

import type { Game } from '../../types/psn-types';
import { PSNGameCard } from './psn-game-card';

interface PSNGamesListProps {
  games: Game[];
  emptyMessage?: string;
}

export function PSNGamesList({ games, emptyMessage = 'No games found' }: PSNGamesListProps) {
  if (games.length === 0) {
    return <div className="text-center py-6 text-gray-400">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <PSNGameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
