import Link from 'next/link';
import { TeamSeasonPlayer } from '../types/team-season-player';

interface PlayerRowProps {
  player: TeamSeasonPlayer;
}

export function SkaterRow({ player }: PlayerRowProps) {
  return (
    <div className="mb-2 flex justify-between items-center last:mb-0">
      <div className="flex items-center gap-2">
        <Link href={`/users/${player.playerSeason.player.id}`} className="hover:text-blue-400">
          {player.playerSeason.player.gamertags[0]?.gamertag || player.playerSeason.player.name}
        </Link>
        <span className="text-xs text-gray-400">
          ${player.playerSeason.contract.amount.toLocaleString()}
        </span>
      </div>
      <span
        className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
      >
        {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
      </span>
    </div>
  );
}
