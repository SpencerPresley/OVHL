export interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

export interface BaseStats {
  id: string;
  teamId: string;
  teamIdentifier: string;
  gamesPlayed: number;
}

export interface PlayerStats extends BaseStats {
  name: string;
  position: string;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
}

export interface GoalieStats extends BaseStats {
  name: string;
  goalsAgainst: number;
  gaa: number;
  savePercentage: number;
  shutouts: number;
}

export interface TeamStats extends BaseStats {
  teamName: string;
  division?: string;
  conference?: string;
  league?: string;
  wins: number;
  losses: number;
  otl: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  powerplayPercentage: number;
  penaltyKillPercentage: number;
}

export type StatCategory = 'players' | 'teams' | 'goalies';

export interface TeamColors {
  primary: string;
  secondary: string;
}
