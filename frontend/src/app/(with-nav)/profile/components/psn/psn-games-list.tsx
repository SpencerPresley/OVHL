import type { Game } from '../../types/psn-types';
import { PSNGameCard } from './psn-game-card';

interface PSNGamesListProps {
  games: Game[];
  emptyMessage?: string;
  totalGamesCount?: number;
}

export function PSNGamesList({
  games,
  emptyMessage = 'No games found',
  totalGamesCount,
}: PSNGamesListProps) {
  if (games.length === 0) {
    return <div className="text-center py-10 text-gray-400">{emptyMessage}</div>;
  }

  return (
    <div>
      {totalGamesCount && (
        <div className="text-sm text-gray-400 mb-3">
          Showing {games.length} of {totalGamesCount} games
        </div>
      )}
      <div className="space-y-4">
        {games.map((game) => (
          <PSNGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
