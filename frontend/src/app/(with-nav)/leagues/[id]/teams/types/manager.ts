/**
 * Manager information interface
 */
import { TeamManagementRole } from '@prisma/client';

interface Manager {
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
  role: TeamManagementRole;
}

export type { Manager };
