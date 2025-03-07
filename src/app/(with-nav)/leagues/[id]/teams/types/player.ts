/**
 * Player information interface including season stats and contract details
 */

import { System } from "@prisma/client";

interface Player {
    playerSeason: {
      player: {
        id: string;
        name: string;
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
    plusMinus: number;
    goalsAgainst: number | null;
    saves: number | null;
  }

export type { Player };