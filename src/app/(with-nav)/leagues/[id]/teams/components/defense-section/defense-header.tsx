import { TeamSeasonPlayer } from '../../types/team-season-player';
import { getPositionPlayers } from '../../utils/player-utils';
import { getPositionCountColor } from '../../utils/position-color-util';

interface DefenseHeaderProps {
  players: TeamSeasonPlayer[];
}

export function DefenseHeader({ players }: DefenseHeaderProps) {
  const defenseCount = getPositionPlayers(players, ['LD', 'RD']).length;
  let countColor = 'text-red-500';
  if (defenseCount == 6) countColor = 'text-green-500';
  else if (defenseCount > 4 && defenseCount < 6) countColor = 'text-yellow-500';
  else if (defenseCount < 4 || defenseCount > 6) countColor = 'text-red-500';

  return (
    <div className="p-4 bg-secondary/30">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Defense</h3>
        <span className={`${countColor} font-medium`}>{defenseCount} players</span>
      </div>
    </div>
  );
}
