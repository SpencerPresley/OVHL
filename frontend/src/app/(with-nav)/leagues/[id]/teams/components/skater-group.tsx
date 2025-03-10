import { TeamSeasonPlayer } from '../types/team-season-player';
import { getPositionPlayers } from '../utils/player-utils';
import { getPositionCountColor } from '../utils/position-color-util';
import { SkaterRow } from './skater-row';

interface SkaterGroupProps {
  title: string;
  players: TeamSeasonPlayer[];
  positions: string[];
}

export function SkaterGroup({ title, players, positions }: SkaterGroupProps) {
  const positionPlayers = getPositionPlayers(players, positions);
  const count = positionPlayers.length;
  const countColor = getPositionCountColor(positions, count);

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
        <h4 className="font-semibold text-primary">{title}</h4>
        <span className={`${countColor} text-sm font-medium`}>{count}</span>
      </div>
      <div className="flex-1">
        {positionPlayers.map((player) => (
          <SkaterRow key={player.playerSeason.player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
