import { notFound } from 'next/navigation';
import { TeamsDisplay } from './teams-display';
import { getApiUrl } from '@/lib/utils/api';

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

  // Fetch teams data from the API
  const url = new URL(`/api/leagues/${league.id}/teams`, getApiUrl());
  // url.searchParams.append('tier', league.id.toUpperCase()); // No longer needed
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch teams');
  }

  const data = await response.json();

  return <TeamsDisplay league={league} teams={data.teams} />;
}
