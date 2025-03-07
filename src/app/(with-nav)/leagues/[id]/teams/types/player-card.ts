import { System } from "@prisma/client";

interface PlayerCard {
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
  }

export type { PlayerCard };