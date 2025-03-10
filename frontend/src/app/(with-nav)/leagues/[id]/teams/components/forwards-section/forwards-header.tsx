import { TeamSeasonPlayer } from '../../types/team-season-player';
import { getPositionPlayers } from '../../utils/player-utils';

interface ForwardsHeaderProps {
  players: TeamSeasonPlayer[];
}

export function ForwardsHeader({ players }: ForwardsHeaderProps) {
  const forwardCount = getPositionPlayers(players, ['LW', 'C', 'RW']).length;
  let countColor = 'text-red-500';
  if (forwardCount == 9) countColor = 'text-green-500';
  else if (forwardCount >= 6 && forwardCount < 9) countColor = 'text-yellow-500';
  else if (forwardCount < 6 || forwardCount > 9) countColor = 'text-red-500';

  return (
    <div className="p-4 bg-secondary/30">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Forwards</h3>
        <span className={`${countColor} font-medium`}>{forwardCount} players</span>
      </div>
    </div>
  );
}
