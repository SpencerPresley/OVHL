import Image from 'next/image';
import { Gamepad2, Clock } from 'lucide-react';
import type { Game } from '../../types/psn-types';
import { 
    formatPlaytime, 
    formatDate, 
    getPlatformLabel 
} from '../../utils/psn-formatters';

interface PSNGameCardProps {
  game: Game;
}

export function PSNGameCard({ game }: PSNGameCardProps) {
  return (
    <div className="flex gap-4 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors">
      <div className="flex-shrink-0 w-16 h-16 relative">
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={game.name}
            width={64}
            height={64}
            className="rounded-md object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-grow">
        <h4 className="font-medium">{game.name}</h4>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatPlaytime(game.playTimeMinutes)}
          </div>
          <div>{getPlatformLabel(game.platform)}</div>
          {game.playCount !== null && game.playCount > 0 && (
            <div>Played {game.playCount} times</div>
          )}
          {game.lastPlayed && <div>Last played: {formatDate(game.lastPlayed)}</div>}
        </div>
      </div>
    </div>
  );
}
