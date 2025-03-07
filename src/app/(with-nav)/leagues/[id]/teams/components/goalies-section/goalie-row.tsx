import Link from 'next/link';
import { TeamSeasonPlayer } from '../../types/team-season-player';

interface GoalieRowProps {
  player: TeamSeasonPlayer;
}

export function GoalieRow({ player }: GoalieRowProps) {
  const saves = player.saves ?? 0;
  const goalsAgainst = player.goalsAgainst ?? 0;
  const totalShots = saves + goalsAgainst;
  const savePercentage = totalShots > 0 ? saves / totalShots : 0;

  let savePercentageColor = 'text-red-500 bg-red-500/20';
  if (savePercentage >= 0.8) {
    savePercentageColor = 'text-green-500 bg-green-500/20';
  } else if (savePercentage >= 0.7) {
    savePercentageColor = 'text-yellow-500 bg-yellow-500/20';
  }

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
      <span className={`px-2 py-0.5 rounded text-sm ${savePercentageColor}`}>
        {totalShots === 0 ? '0.0%' : `${(savePercentage * 100).toFixed(1)}%`}
      </span>
    </div>
  );
}
