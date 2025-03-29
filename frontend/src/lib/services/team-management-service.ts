import { prisma } from '../prisma';
import { TeamManagementRole } from '@prisma/client';

export class TeamManagementService {
  static async getTeamManagers(teamSeasonId: string) {
    console.log(`Fetching managers for teamSeasonId: ${teamSeasonId}`);
    return prisma.teamManager.findMany({
      where: { teamSeasonId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
          include: {
            gamertags: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            }
          }
        },
        teamSeason: {
          include: {
            team: true,
            leagueSeason: {
              include: {
                league: true
              }
            }
          }
        }
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
        teamSeason: {
          include: {
            team: true,
            leagueSeason: {
              include: {
                league: true
              }
            }
          }
        }
      },
    });
  }

  static async addTeamManager(data: { userId: string; teamSeasonId: string; role: TeamManagementRole }) {
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
                      select: { id: true },
                    })
                  )?.id,
                },
              },
              include: {
                contract: true,
              },
            },
          },
        },
      },
    });

    console.log('Found user:', {
      id: user?.id,
      hasPlayer: !!user?.player,
      gamertags: user?.player?.gamertags?.length,
      seasons: user?.player?.seasons?.length,
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
    const teamSeason = await prisma.teamSeason.findUnique({
      where: { id: data.teamSeasonId },
      include: {
        leagueSeason: {
          include: {
            league: { select: { shortName: true }}
          }
        }
      }
    });

    if (!teamSeason) {
      throw new Error('Team Season not found');
    }

    const leagueShortName = teamSeason.leagueSeason.league.shortName.toUpperCase();
    if (!leagueShortName) {
      throw new Error('Team must belong to a league for this season');
    }

    // Validate role based on league
    if (data.role === TeamManagementRole.OWNER && !['NHL', 'CHL'].includes(leagueShortName)) {
      throw new Error('Only NHL and CHL teams can have owners');
    }

    const currentPlayerSeason = user.player.seasons[0];
    if (!currentPlayerSeason) {
      throw new Error('Player not found in current season');
    }

    console.log('Current player season:', {
      id: currentPlayerSeason.id,
      hasContract: !!currentPlayerSeason.contract,
    });

    // Start a transaction to handle both team manager creation and contract update
    return prisma.$transaction(async (tx) => {
      console.log('Starting transaction');

      // Create the team manager record
      const manager = await tx.teamManager.create({
        data: {
          userId: data.userId,
          teamSeasonId: data.teamSeasonId,
          role: data.role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
            include: {
              gamertags: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              }
            }
          },
          teamSeason: {
            include: {
              team: true
            }
          }
        },
      });

      console.log('Created manager record');

      // Only set contract to 0 for OWNER, GM, and AGM roles
      switch (data.role) {
        case TeamManagementRole.OWNER:
        case TeamManagementRole.GM:
        case TeamManagementRole.AGM:
          if (currentPlayerSeason.contract) {
            console.log('Updating existing contract to 0');
            await tx.contract.update({
              where: { id: currentPlayerSeason.contract.id },
              data: { amount: 0 },
            });
          } else {
            console.log('Creating new contract with amount 0');
            await tx.contract.create({
              data: {
                playerSeason: {
                  connect: {
                    id: currentPlayerSeason.id,
                  },
                },
                amount: 0,
              },
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
    teamSeasonId: string;
    role: TeamManagementRole;
  }) {
    return prisma.teamManager.deleteMany({
      where: {
        userId: data.userId,
        teamSeasonId: data.teamSeasonId,
        role: data.role,
      },
    });
  }

  static async isTeamManager(userId: string, teamSeasonId: string) {
    const count = await prisma.teamManager.count({
      where: {
        userId,
        teamSeasonId,
      },
    });
    return count > 0;
  }

  static async getManagerRole(userId: string, teamSeasonId: string) {
    const manager = await prisma.teamManager.findFirst({
      where: {
        userId,
        teamSeasonId,
      },
    });
    return manager?.role || null;
  }
}
