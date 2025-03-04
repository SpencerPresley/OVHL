import { PrismaClient, TeamManagementRole } from '@prisma/client';
import { notFound } from 'next/navigation';
import { BiddingBoard } from './bidding-board';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';
import { NHLTeam, AHLTeam, ECHLTeam, CHLTeam } from '@/lib/teams/types';

const prisma = new PrismaClient();

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface Team {
  id: string;
  name: string;
  identifier: string;
  managers: {
    userId: string;
    name: string;
    role: TeamManagementRole;
  }[];
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

const leagues: Record<string, League> = {
  nhl: {
    id: 'nhl',
    name: 'NHL',
    logo: '/nhl_logo.png',
    bannerColor: 'bg-blue-900',
  },
  ahl: {
    id: 'ahl',
    name: 'AHL',
    logo: '/ahl_logo.png',
    bannerColor: 'bg-yellow-400',
  },
  echl: {
    id: 'echl',
    name: 'ECHL',
    logo: '/echl_logo.png',
    bannerColor: 'bg-emerald-600',
  },
  chl: {
    id: 'chl',
    name: 'CHL',
    logo: '/chl_logo.png',
    bannerColor: 'bg-teal-600',
  },
};

export default async function BiddingPage({ params }: { params: { id: string } }) {
  const paramsData = await params;
  const league = leagues[paramsData.id.toLowerCase()];
  if (!league) {
    notFound();
  }

  // Get the latest season
  const season = await prisma.season.findFirst({
    where: { isLatest: true },
  });

  if (!season) {
    notFound();
  }

  // Get the tier for this league and all tiers above it
  const tier = await prisma.tier.findFirst({
    where: {
      seasonId: season.id,
      name: league.id.toUpperCase(),
    },
    include: {
      teams: {
        include: {
          team: {
            include: {
              managers: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
          players: {
            include: {
              playerSeason: {
                include: {
                  player: {
                    include: {
                      user: true,
                      gamertags: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                      },
                    },
                  },
                  contract: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!tier) {
    notFound();
  }

  // Get all available players for this tier
  const availablePlayers = await prisma.playerSeason.findMany({
    where: {
      seasonId: season.id,
      isInBidding: true,
      teamSeasons: {
        none: {
          teamSeason: {
            tierId: tier.id,
          },
        },
      },
    },
    include: {
      player: {
        include: {
          user: true,
          gamertags: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
      contract: true,
    },
  });

  // Map the data to a more convenient structure for the client
  const teams = tier.teams
    .map((teamSeason) => {
      // Get the correct team data from the league-specific data
      let teamData: (NHLTeam | AHLTeam | ECHLTeam | CHLTeam) | undefined;
      switch (league.id) {
        case 'nhl':
          teamData = NHL_TEAMS.find((t) => t.id === teamSeason.team.teamIdentifier.toLowerCase());
          break;
        case 'ahl':
          teamData = AHL_TEAMS.find((t) => t.id === teamSeason.team.teamIdentifier.toLowerCase());
          break;
        case 'echl':
          teamData = ECHL_TEAMS.find((t) => t.id === teamSeason.team.teamIdentifier.toLowerCase());
          break;
        case 'chl':
          teamData = CHL_TEAMS.find((t) => t.id === teamSeason.team.teamIdentifier.toLowerCase());
          break;
      }

      // Skip teams that don't belong to this league
      if (!teamData) return null;

      const team: Team = {
        id: teamSeason.team.id,
        name: teamData.name, // Use the name from league data instead of database
        identifier: teamSeason.team.teamIdentifier,
        managers: teamSeason.team.managers.map((m) => ({
          userId: m.user.id,
          name: m.user.name || m.user.username || m.user.email,
          role: m.role,
        })),
        stats: {
          wins: teamSeason.wins,
          losses: teamSeason.losses,
          otLosses: teamSeason.otLosses,
        },
        roster: {
          forwards: teamSeason.players.filter((p) =>
            ['LW', 'C', 'RW'].includes(p.playerSeason.position)
          ).length,
          defense: teamSeason.players.filter((p) => ['LD', 'RD'].includes(p.playerSeason.position))
            .length,
          goalies: teamSeason.players.filter((p) => p.playerSeason.position === 'G').length,
        },
        salary: {
          current: teamSeason.players.reduce((sum, p) => sum + p.playerSeason.contract.amount, 0),
          cap: tier.salaryCap,
        },
      };

      return team;
    })
    .filter((team): team is Team => team !== null);

  const mappedPlayers = availablePlayers.map((playerSeason) => ({
    id: playerSeason.id,
    name: playerSeason.player.name,
    position: playerSeason.position,
    gamertag: playerSeason.player.gamertags[0]?.gamertag || playerSeason.player.name,
    currentBid: null, // We'll implement this when we add the bidding system
    currentTeamId: null, // Added for compatibility with the Player interface
    currentTeamName: null, // Added for compatibility with the Player interface
    bids: [], // Added for compatibility with the Player interface
    contract: {
      amount: playerSeason.contract.amount,
    },
    stats: {
      gamesPlayed: playerSeason.gamesPlayed || 0,
      goals: playerSeason.goals || 0,
      assists: playerSeason.assists || 0,
      plusMinus: playerSeason.plusMinus || 0,
    },
    player: {
      user: {
        id: playerSeason.player.user.id,
      },
    },
  }));

  return <BiddingBoard league={league} teams={teams} availablePlayers={mappedPlayers} />;
}
