import { TeamManagementRole } from '@prisma/client';

export interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

export interface TeamManager {
  userId: string;
  name: string;
  role: TeamManagementRole;
}

export interface Team {
  id: string;
  name: string;
  identifier: string;
  managers: TeamManager[];
  stats: {
    wins: number;
    losses: number;
    otLosses: number;
  };
  roster: {
    forwards: number;
    defense: number;
    goalies: number;
  };
  salary: {
    current: number;
    cap: number;
  };
}

export interface Bid {
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  gamertag: string;
  currentBid: number | null;
  currentTeamId: string | null;
  currentTeamName: string | null;
  bids: Bid[];
  endTime?: number;
  contract: {
    amount: number;
  };
  stats: {
    gamesPlayed: number;
    goals: number;
    assists: number;
    plusMinus: number;
  };
  player: {
    user: {
      id: string;
    };
  };
}

export interface PlayerPositionGroup {
  id: string;
  name: string;
  position: string;
  gamertag: string;
  contractAmount: number;
}

export interface ActivePlayerInfo {
  gamertag: string;
  currentTeamId: string | null;
}

export interface ActiveBid {
  playerSeasonId: string;
  playerName: string;
  position: string;
  amount: number;
  endTime: number;
}

export interface TeamData {
  activeBids: {
    playerSeasonId: string;
    playerName: string;
    position: string;
    amount: number;
    endTime: number;
  }[];
  totalCommitted: number;
  roster: {
    id: string;
    name: string;
    position: string;
    gamertag: string;
    contractAmount: number;
  }[];
  salaryCap: number;
  currentSalary: number;
}

export interface AvailablePlayer {
  id: string;
  gamertag: string;
  currentTeamId: string | null;
}
