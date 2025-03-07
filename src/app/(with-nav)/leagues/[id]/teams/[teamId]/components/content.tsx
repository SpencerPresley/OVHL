import { Team } from '@/types/team';
import { TeamManagementRole } from '@prisma/client';
import { TeamManagementPanel } from './team-management-panel';
import { PlayerPositionSection } from './player-position-section';
import { ProcessedPlayer } from '../utils/player-processing';

// Add missing interface definitions
interface Manager {
  role: TeamManagementRole;
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    player: {
      id: string;
      gamertags: {
        gamertag: string;
      }[];
    } | null;
  };
}

interface ContentProps {
  managers: Manager[];
  forwards: ProcessedPlayer[];
  defense: ProcessedPlayer[];
  goalies: ProcessedPlayer[];
}

export function Content({ managers, forwards, defense, goalies }: ContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <TeamManagementPanel managers={managers} />

      <PlayerPositionSection title="Forwards" players={forwards} showSeparator={false} />

      <PlayerPositionSection title="Defense" players={defense} />

      <PlayerPositionSection title="Goalies" players={goalies} />
    </div>
  );
}
