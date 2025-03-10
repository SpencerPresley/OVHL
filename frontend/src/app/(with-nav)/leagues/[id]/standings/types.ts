/**
 * League configuration type
 */
export interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

/**
 * Individual team statistics type
 */
export interface TeamStats {
  teamId: string;
  teamName: string;
  teamIdentifier: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  powerplayGoals: number;
  powerplayOpportunities: number;
  powerplayPercentage: number;
  penaltyKillGoalsAgainst: number;
  penaltyKillOpportunities: number;
  penaltyKillPercentage: number;
}

/**
 * Division standings containing teams
 */
export interface DivisionStandings {
  division: string;
  teams: TeamStats[];
}
