import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { BiddingBoard } from './bidding-board';

const prisma = new PrismaClient();

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
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
            tierId: tier.id
          }
        }
      }
    },
    include: {
      player: {
        include: {
          gamertags: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      },
      contract: true
    }
  });

  // Map the data to a more convenient structure for the client
  const teams = tier.teams.map(teamSeason => ({
    id: teamSeason.team.id,
    name: teamSeason.team.officialName,
    identifier: teamSeason.team.teamIdentifier,
    managers: teamSeason.team.managers.map(m => ({
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
      forwards: teamSeason.players.filter(p => ['LW', 'C', 'RW'].includes(p.playerSeason.position)).length,
      defense: teamSeason.players.filter(p => ['LD', 'RD'].includes(p.playerSeason.position)).length,
      goalies: teamSeason.players.filter(p => p.playerSeason.position === 'G').length,
    },
    salary: {
      current: teamSeason.players.reduce((sum, p) => sum + p.playerSeason.contract.amount, 0),
      cap: tier.salaryCap,
    },
  }));

  const mappedPlayers = availablePlayers.map(playerSeason => ({
    id: playerSeason.id,
    name: playerSeason.player.name,
    position: playerSeason.position,
    gamertag: playerSeason.player.gamertags[0]?.gamertag || playerSeason.player.name,
    currentBid: null, // We'll implement this when we add the bidding system
    contract: {
      amount: playerSeason.contract.amount,
    },
    stats: {
      gamesPlayed: playerSeason.gamesPlayed || 0,
      goals: playerSeason.goals || 0,
      assists: playerSeason.assists || 0,
      plusMinus: playerSeason.plusMinus || 0,
    },
  }));

  return <BiddingBoard 
    league={league}
    teams={teams}
    availablePlayers={mappedPlayers}
  />;
} 