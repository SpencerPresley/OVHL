import {
  Prisma,
  NotificationType,
  NotificationStatus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ForumPostStatus,
  System,
  PlayerMatch,
} from '@prisma/client';
import { prisma } from '../prisma';

export interface CareerStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  shots: number;
  hits: number;
  takeaways: number;
  giveaways: number;
  penaltyMinutes: number;
  saves?: number;
  goalsAgainst?: number;
  shutouts?: number;
}

export interface PlayerSeason {
  id: string;
  position: string;
  contract: {
    amount: number;
  } | null;
  teamSeasons: {
    teamSeason: {
      id: string;
      team: {
        id: string;
        officialName: string;
        teamIdentifier: string;
      };
      leagueSeason: {
        league: {
          name: string;
          shortName: string;
        }
      }
    };
  }[];
}

export interface Player {
  id: string;
  gamertags: {
    gamertag: string;
    createdAt: Date;
    system: System;
  }[];
  seasons: PlayerSeason[];
}

export type UserWithoutPlayer = Omit<UserProfileResponse, 'player'> & { player: null };
export type UserWithPlayer = Omit<UserProfileResponse, 'player'> & {
  player: Player | null;
  avatarUrl: string | null;
};

export interface NoPlayerProfile {
  hasPlayer: false;
  user: UserWithoutPlayer;
}

export interface PlayerProfile {
  hasPlayer: true;
  user: UserWithPlayer;
  currentGamertag: string;
  initials: string;
  system: string;
  currentContract: number | null;
  careerStats: CareerStats | null;
}

export type FormattedUserProfile = NoPlayerProfile | PlayerProfile;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  isAdmin: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  resetToken: string | null;
  resetTokenExpiresAt: Date | null;
}

export class UserService {
  static async getCurrentUser() {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }

  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        gamertags: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        activeSeasons: {
          include: {
            contract: true,
            teamSeasons: {
              include: {
                team: {
                  include: {
                    team: true,
                    leagueSeason: {
                      include: {
                        league: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { season: { seasonNumber: 'desc' } },
        },
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  static async updateProfile(
    id: string,
    data: {
      name?: string;
      email?: string;
      username?: string;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async getUserNotifications(userId: string, status?: NotificationStatus) {
    return prisma.notification.findMany({
      where: {
        userId,
        status: status || undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getUserForumPosts(userId: string) {
    return prisma.forumPost.findMany({
      where: {
        authorId: userId,
        status: 'PUBLISHED',
      },
      include: {
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getUserForumActivity(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        forumPosts: {
          where: { status: 'PUBLISHED' },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        forumComments: {
          where: { status: 'PUBLISHED' },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        forumReactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async isAdmin(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    return user?.isAdmin ?? false;
  }

  static async markNotificationsAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        status: 'UNREAD',
      },
      data: {
        status: 'READ',
      },
    });
  }

  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
      },
    });
  }

  static async getNotificationById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  static async restoreNotification(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { status: NotificationStatus.READ },
    });
  }

  static async archiveNotification(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { status: NotificationStatus.ARCHIVED },
    });
  }

  static async createForumCommentNotification({
    userId,
    commenterName,
    postTitle,
    postId,
    commentId,
    leagueId,
    isAuthorNotification = false,
  }: {
    userId: string;
    commenterName: string;
    postTitle: string;
    postId: string;
    commentId: string;
    leagueId: string;
    isAuthorNotification?: boolean;
  }) {
    return this.createNotification({
      userId,
      type: NotificationType.FORUM,
      title: isAuthorNotification ? 'New Comment on Your Post' : 'New Comment',
      message: isAuthorNotification
        ? `${commenterName} commented on your post "${postTitle}"`
        : `${commenterName} commented on "${postTitle}"`,
      link: `/leagues/${leagueId}/forum/posts/${postId}#comment-${commentId}`,
      metadata: {
        postId,
        commentId,
        leagueId,
      },
    });
  }

  static async calculateCareerStats(userId: string): Promise<CareerStats | null> {
    try {
      const playerSeasons = await prisma.playerSeason.findMany({
        where: { userId: userId },
        include: {
          playerMatches: true,
        },
      });

      if (!playerSeasons || playerSeasons.length === 0) {
        return null;
      }

      let totals: CareerStats = {
        gamesPlayed: 0,
        goals: 0,
        assists: 0,
        points: 0,
        plusMinus: 0,
        shots: 0,
        hits: 0,
        takeaways: 0,
        giveaways: 0,
        penaltyMinutes: 0,
        saves: 0,
        goalsAgainst: 0,
        shutouts: 0,
      };

      let isGoalie = false;

      for (const season of playerSeasons) {
        for (const match of season.playerMatches) {
          totals.gamesPlayed += 1;
          totals.goals += match.goals ?? 0;
          totals.assists += match.assists ?? 0;
          totals.points += (match.goals ?? 0) + (match.assists ?? 0);
          totals.plusMinus += match.plusMinus ?? 0;
          totals.shots += match.shots ?? 0;
          totals.hits += match.hits ?? 0;
          totals.takeaways += match.takeaways ?? 0;
          totals.giveaways += match.giveaways ?? 0;
          totals.penaltyMinutes += match.pim ?? 0;

          if (match.saves !== null || match.goalsAgainst !== null) {
            isGoalie = true;
            totals.saves = (totals.saves ?? 0) + (match.saves ?? 0);
            totals.goalsAgainst = (totals.goalsAgainst ?? 0) + (match.goalsAgainst ?? 0);
            if (match.goalsAgainst === 0 && (match.timeOnIceSeconds ?? 0) > 0) {
              totals.shutouts = (totals.shutouts ?? 0) + 1;
            }
          }
        }
      }

      if (!isGoalie) {
        delete totals.saves;
        delete totals.goalsAgainst;
        delete totals.shutouts;
      }

      return totals;
    } catch (error) {
      console.error(`Failed to calculate career stats for user ${userId}:`, error);
      return null;
    }
  }

  static async formatUserProfileData(userId: string): Promise<FormattedUserProfile | null> {
    const user = await this.getUserById(userId);

    if (!user) {
      return null;
    }

    const hasPlayerData = user.activeSeasons && user.activeSeasons.length > 0;

    if (!hasPlayerData) {
      const { password, passwordResetToken, passwordResetTokenExpiresAt, ...safeUser } = user;
      return {
        hasPlayer: false,
        user: { ...safeUser, player: null } as UserWithoutPlayer,
      };
    }

    const currentGamertagObj = user.gamertags[0];
    const currentGamertag = currentGamertagObj?.gamertag || 'Unknown Player';
    const initials = currentGamertag.charAt(0).toUpperCase();
    const system = currentGamertagObj?.system || 'Unknown System';

    const latestPlayerSeason = user.activeSeasons[0];
    const currentContract = latestPlayerSeason?.contract?.amount ?? null;

    const careerStats = await this.calculateCareerStats(userId);

    const playerObject: Player | null = {
      id: userId,
      gamertags: user.gamertags.map(gt => ({ ...gt, system: gt.system as System })),
      seasons: user.activeSeasons.map(ps => ({
        id: ps.id,
        position: ps.primaryPosition,
        contract: ps.contract ? { amount: ps.contract.amount } : null,
        teamSeasons: ps.teamSeasons.map(pts => ({
          teamSeason: {
            id: pts.team.id,
            team: {
              id: pts.team.team.id,
              officialName: pts.team.team.fullTeamName,
              teamIdentifier: pts.team.team.teamAbbreviation,
            },
            leagueSeason: {
              league: {
                name: pts.team.leagueSeason.league.name,
                shortName: pts.team.leagueSeason.league.shortName,
              },
            },
          },
        })),
      })),
    };

    const { password, passwordResetToken, passwordResetTokenExpiresAt, ...safeUser } = user;

    return {
      hasPlayer: true,
      user: { ...safeUser, player: playerObject } as UserWithPlayer,
      currentGamertag,
      initials,
      system,
      currentContract,
      careerStats,
    };
  }

  static async updateAvatar(userId: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      const uploadData = await uploadResponse.json();

      const updateResponse = await fetch(`/api/users/${userId}/avatar`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl: uploadData.url }),
      });

      const responseData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          responseData.message || responseData.details || 'Failed to update user avatar'
        );
      }

      return responseData.user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      console.error('Error uploading avatar:', errorMessage);
      throw error;
    }
  }

  static async removeAvatar(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}/avatar`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove avatar');
      }

      const { user } = await response.json();
      return user;
    } catch (error) {
      console.error('Error removing avatar:', error);
      throw error;
    }
  }

  static async getUserPSNProfile(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}/psn`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch PSN profile:', error);
      return null;
    }
  }
}

export type UserProfileResponse = Prisma.PromiseReturnType<typeof UserService.getUserById>;
