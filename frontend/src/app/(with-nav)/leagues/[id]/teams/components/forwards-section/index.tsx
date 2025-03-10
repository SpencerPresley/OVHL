import { TeamSeasonPlayer } from '../../types/team-season-player';
import { ForwardsHeader } from './forwards-header';
import { SkaterGroup } from '../skater-group';
interface ForwardsSectionProps {
  players: TeamSeasonPlayer[];
}

export function ForwardsSection({ players }: ForwardsSectionProps) {
  return (
    <div className="border-b border-border">
      <ForwardsHeader players={players} />
      <div className="p-4 space-y-4">
        <SkaterGroup title="Left Wing" players={players} positions={['LW']} />
        <SkaterGroup title="Center" players={players} positions={['C']} />
        <SkaterGroup title="Right Wing" players={players} positions={['RW']} />
      </div>
    </div>
  );
}
