import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { TeamsDisplay } from './teams-display';

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

export default async function TeamsPage({ params }: { params: { id: string } }) {
  const parameters = await params;
  const league = leagues[parameters.id.toLowerCase()];
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

  // Get all teams in this league
  const tier = await prisma.tier.findFirst({
    where: {
      seasonId: season.id,
      name: league.id.toUpperCase(),
    },
    include: {
      teams: {
        include: {
          team: true,
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

  if (!tier) {
    notFound();
  }

  return <TeamsDisplay league={league} teams={tier.teams} />;
}
