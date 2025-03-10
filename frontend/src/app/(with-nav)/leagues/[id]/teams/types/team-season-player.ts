import { System } from '@prisma/client';

interface TeamSeasonPlayer {
  playerSeason: {
    player: {
      id: string;
      name: string;
      user: {
        id: string;
      };
      gamertags: {
        gamertag: string;
        system: System;
      }[];
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
  goalsAgainst: number | null;
  saves: number | null;
}

export type { TeamSeasonPlayer };
