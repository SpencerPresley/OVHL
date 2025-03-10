import { Manager } from './manager';
import { TeamSeasonPlayer } from './team-season-player';

interface TeamSeason {
  team: {
    id: string;
    officialName: string;
    teamIdentifier: string;
    managers: Manager[];
  };
  tier: {
    name: string;
    salaryCap: number;
  };
  wins: number;
  losses: number;
  otLosses: number;
  players: TeamSeasonPlayer[];
}

export type { TeamSeason };
