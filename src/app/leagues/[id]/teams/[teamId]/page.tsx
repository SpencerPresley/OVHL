import { notFound } from 'next/navigation';
import { TeamDisplay } from './team-display';
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

export default async function TeamPage({ params }: { params: { id: string; teamId: string } }) {
  const paramsData = await params;
  const league = leagues[paramsData.id.toLowerCase()];
  if (!league) {
    notFound();
  }

  // Fetch team data from the API
  const url = new URL(`/api/leagues/${league.id}/teams/${paramsData.teamId}`, getApiUrl());
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch team');
  }

  const data = await response.json();

  return (
    <TeamDisplay
      league={league}
      team={data.team}
      teamSeason={data.teamSeason}
      managers={data.managers}
    />
  );
}
