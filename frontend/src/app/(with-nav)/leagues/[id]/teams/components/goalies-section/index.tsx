import { TeamSeasonPlayer } from '../../types/team-season-player';
import { GoaliesHeader } from './goalies-header';
import { GoalieGroup } from './goalie-group';

interface GoaliesSectionProps {
  players: TeamSeasonPlayer[];
}

export function GoaliesSection({ players }: GoaliesSectionProps) {
  return (
    <div>
      <GoaliesHeader players={players} />
      <div className="p-4">
        <GoalieGroup title="Goalies" players={players} positions={['G']} />
      </div>
    </div>
  );
}
