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
          players: {
            include: {
              playerSeason: {
                include: {
                  player: {
                    include: {
                      gamertags: true,
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

  if (!team || !team.seasons[0]) {
    notFound();
  }

  const teamSeason = team.seasons[0];

  return <TeamDisplay league={league} team={team} teamSeason={teamSeason} />;
}
