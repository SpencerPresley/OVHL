import { prisma } from '../prisma';
import { TeamManagementRole } from '@prisma/client';

export class TeamManagementService {
  static async getTeamManagers(teamId: string) {
    return prisma.teamManager.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            player: {
              select: {
                id: true,
                gamertags: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER first, then GM, AGM, PAGM
        { createdAt: 'asc' },
      ],
    });
  }

  static async getUserManagementRoles(userId: string) {
    return prisma.teamManager.findMany({
      where: { userId },
      include: {
        team: true,
      },
    });
  }

  static async addTeamManager(data: {
    userId: string;
    teamId: string;
    role: TeamManagementRole;
  }) {
    console.log('Starting addTeamManager with data:', data);

    // First check if the user exists and has a player profile
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { 
        player: {
          include: {
            gamertags: true,
            seasons: {
              where: {
                seasonId: {
                  equals: (
                    await prisma.season.findFirst({
                      where: { isLatest: true },
                      select: { id: true }
                    })
                  )?.id
                }
              },
              include: {
                contract: true
              }
            }
          }
        }
      },
    });

    console.log('Found user:', {
      id: user?.id,
      hasPlayer: !!user?.player,
      gamertags: user?.player?.gamertags?.length,
      seasons: user?.player?.seasons?.length
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.player) {
      throw new Error('User must be a player to be assigned a management role');
    }

    // Get the latest season
    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!latestSeason) {
      throw new Error('No active season found');
    }

    // Check if the team exists and get its league
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
      include: {
        seasons: {
          where: {
            tier: {
              seasonId: latestSeason.id
            }
          },
          include: {
            tier: true
          },
          take: 1
        },
      },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const league = team.seasons[0]?.tier.name.toUpperCase();
    if (!league) {
      throw new Error('Team must be assigned to a league');
    }

    // Validate role based on league
    if (data.role === TeamManagementRole.OWNER && !['NHL', 'CHL'].includes(league)) {
      throw new Error('Only NHL and CHL teams can have owners');
    }

    const currentSeason = user.player.seasons[0];
    if (!currentSeason) {
      throw new Error('Player not found in current season');
    }

    console.log('Current season:', {
      id: currentSeason.id,
      hasContract: !!currentSeason.contract
    });

    // Start a transaction to handle both team manager creation and contract update
    return prisma.$transaction(async (tx) => {
      console.log('Starting transaction');

      // Create the team manager record
      const manager = await tx.teamManager.create({
        data: {
          userId: data.userId,
          teamId: data.teamId,
          role: data.role
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              player: {
                include: {
                  gamertags: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          },
          team: true,
        },
      });

      console.log('Created manager record');

      // Only set contract to 0 for OWNER, GM, and AGM roles
      switch (data.role) {
        case TeamManagementRole.OWNER:
        case TeamManagementRole.GM:
        case TeamManagementRole.AGM:
          if (currentSeason.contract) {
            console.log('Updating existing contract to 0');
            await tx.contract.update({
              where: { id: currentSeason.contract.id },
              data: { amount: 0 },
            });
          } else {
            console.log('Creating new contract with amount 0');
            await tx.contract.create({
              data: {
                playerSeasonId: currentSeason.id,
                amount: 0
              }
            });
          }
          break;
      }

      console.log('Transaction complete');
      return manager;
    });
  }

  static async removeTeamManager(data: {
    userId: string;
    teamId: string;
    role: TeamManagementRole;
  }) {
    return prisma.teamManager.deleteMany({
      where: {
        userId: data.userId,
        teamId: data.teamId,
        role: data.role,
      },
    });
  }

  static async isTeamManager(userId: string, teamId: string) {
    const count = await prisma.teamManager.count({
      where: {
        userId,
        teamId,
      },
    });
    return count > 0;
  }

  static async getManagerRole(userId: string, teamId: string) {
    const manager = await prisma.teamManager.findFirst({
      where: {
        userId,
        teamId,
      },
    });
    return manager?.role || null;
  }
} 
