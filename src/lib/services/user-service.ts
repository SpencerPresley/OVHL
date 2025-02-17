import { 
    Prisma, 
    NotificationType, 
    NotificationStatus, 
    ForumPostStatus, 
    System,
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
}

export interface PlayerSeason {
  id: string;
  position: string;
  gamesPlayed: number | null;
  goals: number | null;
  assists: number | null;
  plusMinus: number | null;
  shots: number | null;
  hits: number | null;
  takeaways: number | null;
  giveaways: number | null;
  penaltyMinutes: number | null;
  saves: number | null;
  goalsAgainst: number | null;
  contract: {
    amount: number;
  } | null;
  teamSeasons: {
    teamSeason: {
      team: {
        id: string;
        officialName: string;
        teamIdentifier: string;
      };
      tier: {
        name: string;
      };
    };
    gamesPlayed: number | null;
    goals: number | null;
    assists: number | null;
    plusMinus: number | null;
    shots: number | null;
    hits: number | null;
    takeaways: number | null;
    giveaways: number | null;
    penaltyMinutes: number | null;
  }[];
}

export interface Player {
  id: string;
  gamertags: {
    gamertag: string;
    createdAt: Date;
    playerId: string;
    system: System;
  }[];
  seasons: PlayerSeason[];
}

export type UserWithoutPlayer = Omit<UserProfileResponse, 'player'> & { player: null };
export type UserWithPlayer = Omit<UserProfileResponse, 'player'> & {
  player: Player;
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
  currentContract: number;
  careerStats: CareerStats;
}

export type FormattedUserProfile = NoPlayerProfile | PlayerProfile;

export class UserService {
  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        player: {
          include: {
            gamertags: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            seasons: {
              include: {
                contract: true,
                teamSeasons: {
                  include: {
                    teamSeason: {
                      include: {
                        team: true,
                        tier: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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


  static async getUserNotifications(
    userId: string,
    status?: NotificationStatus,
  ) {
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
  
  // For type safety in components
  static readonly UserProfileInclude = {
    player: {
      include: {
        gamertags: {
          orderBy: { createdAt: 'desc' as const },
          take: 1,
        },
        seasons: {
          include: {
            contract: true,
            teamSeasons: {
              include: {
                teamSeason: {
                  include: {
                    team: true,
                    tier: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  } as const;

  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
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

  static calculateCareerStats(seasons: any[]): CareerStats {
    return seasons.reduce(
      (totals, season) => {
        totals.gamesPlayed += season.gamesPlayed || 0;
        totals.goals += season.goals || 0;
        totals.assists += season.assists || 0;
        totals.points += (season.goals || 0) + (season.assists || 0);
        totals.plusMinus += season.plusMinus || 0;
        totals.shots += season.shots || 0;
        totals.hits += season.hits || 0;
        totals.takeaways += season.takeaways || 0;
        totals.giveaways += season.giveaways || 0;
        totals.penaltyMinutes += season.penaltyMinutes || 0;
        return totals;
      },
      {
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
      }
    );
  }

  static formatUserProfileData(user: UserProfileResponse): FormattedUserProfile {
    if (!user?.player) {
      return {
        hasPlayer: false,
        user: { ...user, player: null },
      };
    }

    const currentGamertag = user.player.gamertags[0]?.gamertag || 'Unknown Player';
    const initials = currentGamertag.charAt(0).toUpperCase();
    const system = user.player.gamertags[0]?.system || 'Unknown System';
    const currentContract = user.player.seasons[0]?.contract?.amount || 500000;
    const careerStats = this.calculateCareerStats(user.player.seasons);

    return {
      hasPlayer: true,
      user: { ...user, player: user.player! } as UserWithPlayer,
      currentGamertag,
      initials,
      system,
      currentContract,
      careerStats,
    };
  }
}

export type UserProfileResponse = Prisma.PromiseReturnType<typeof UserService.getUserById>;