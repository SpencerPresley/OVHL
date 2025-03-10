import { TeamSeasonPlayer } from '../../types/team-season-player';
import { getPositionPlayers } from '../../utils/player-utils';

interface GoaliesHeaderProps {
  players: TeamSeasonPlayer[];
}

export function GoaliesHeader({ players }: GoaliesHeaderProps) {
  const goalieCount = getPositionPlayers(players, ['G']).length;
  let countColor = 'text-red-500';
  if (goalieCount < 2 && goalieCount > 0) countColor = 'text-yellow-500';
  else if (goalieCount == 2) countColor = 'text-green-500';
  else if (goalieCount == 0 || goalieCount > 2) countColor = 'text-red-500';

  return (
    <div className="p-4 bg-secondary/30">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Goalies</h3>
        <span className={`${countColor} font-medium`}>{goalieCount} players</span>
      </div>
    </div>
  );
}
