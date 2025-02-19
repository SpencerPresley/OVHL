import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { TeamDisplay } from './team-display';

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

export default async function TeamPage({ params }: { params: { id: string; teamId: string } }) {
  // Get league info
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

  // Get the team and its current season data
  const team = await prisma.team.findFirst({
    where: { teamIdentifier: paramsData.teamId.toUpperCase() },
    include: {
      seasons: {
        where: {
          tier: {
            seasonId: season.id,
          },
        },
        include: {
          tier: true,
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
      managers: {
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
        },
        orderBy: {
          role: 'asc',
        },
      },
    },
  });

  if (!team || !team.seasons[0]) {
    notFound();
  }

  const teamSeason = team.seasons[0];

  // Debug log to check the data structure
  console.log('Team Data:', {
    managers: team.managers.map(m => ({
      role: m.role,
      userId: m.user.id,
    })),
    players: teamSeason.players.map(p => ({
      name: p.playerSeason.player.name,
      userId: p.playerSeason.player.user?.id,
      contract: p.playerSeason.contract,
    })),
    tier: teamSeason.tier,
    salaryCap: teamSeason.tier.salaryCap
  });

  return <TeamDisplay 
    league={league} 
    team={team} 
    teamSeason={{
      ...teamSeason,
      tier: teamSeason.tier
    }}
    managers={team.managers} 
  />;
}
