import { TeamSeason } from '../types/team-season';
import { TeamsManagement } from './teams-management';
import { ForwardsSection } from './forwards-section';
import { DefenseSection } from './defense-section';
import { GoaliesSection } from './goalies-section';

interface TeamsCardContentProps {
  teamSeason: TeamSeason;
}

export function TeamsCardContent({ teamSeason }: TeamsCardContentProps) {

  return (
    <>
      <TeamsManagement managers={teamSeason.managers} />
      <ForwardsSection players={teamSeason.players} />
      <DefenseSection players={teamSeason.players} />
      <GoaliesSection players={teamSeason.players} />
    </>
  );
}
