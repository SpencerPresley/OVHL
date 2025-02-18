import { StandingsDisplay } from './standings-display';
import { notFound } from 'next/navigation';

/**
 * League configuration type
 */
interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

/**
 * Available leagues in the system with their specific configurations
 */
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

export default async function LeagueStandingsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const league = leagues[id.toLowerCase()];

  if (!league) {
    notFound();
  }

  return <StandingsDisplay league={league} />;
}
