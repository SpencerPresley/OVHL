import { TeamSeasonPlayer } from '../../types/team-season-player';
import { DefenseHeader } from './defense-header';
import { SkaterGroup } from '../skater-group';

interface DefenseSectionProps {
  players: TeamSeasonPlayer[];
}

export function DefenseSection({ players }: DefenseSectionProps) {
  return (
    <div className="border-b border-border">
      <DefenseHeader players={players} />
      <div className="p-4 space-y-4">
        <SkaterGroup title="Left Defense" players={players} positions={['LD']} />
        <SkaterGroup title="Right Defense" players={players} positions={['RD']} />
      </div>
    </div>
  );
}
