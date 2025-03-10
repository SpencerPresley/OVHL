import { System, TeamManagementRole } from '@prisma/client';

interface PlayerSeasonData {
  playerSeason: {
    player: {
      id: string;
      name: string;
      activeSystem: System;
      gamertags: {
        gamertag: string;
      }[];
      user?: {
        id: string;
      };
    };
    position: string;
    contract: {
      amount: number;
    };
  };
  gamesPlayed: number;
  goals: number;
  assists: number;
  plusMinus: number;
}

interface Manager {
  role: TeamManagementRole;
  user: {
    id: string;
    player?: {
      id: string;
    } | null;
  };
}

export interface ProcessedPlayer {
  id: string;
  name: string;
  position: string;
  system: System;
  gamertag: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  contract: {
    amount: number;
  };
  isManager: boolean;
}

export function processPlayerData(
  players: PlayerSeasonData[],
  managers: Manager[]
): ProcessedPlayer[] {
  return players.map((ps: PlayerSeasonData) => {
    const manager = managers.find((m: Manager) => m.user.id === ps.playerSeason.player.user?.id);

    return {
      id: ps.playerSeason.player.id,
      name: ps.playerSeason.player.name,
      position: ps.playerSeason.position,
      system: ps.playerSeason.player.activeSystem,
      gamertag: ps.playerSeason.player.gamertags[0]?.gamertag || ps.playerSeason.player.name,
      gamesPlayed: ps.gamesPlayed,
      goals: ps.goals,
      assists: ps.assists,
      points: ps.goals + ps.assists,
      plusMinus: ps.plusMinus,
      contract: ps.playerSeason.contract,
      isManager: !!manager,
    };
  });
}
