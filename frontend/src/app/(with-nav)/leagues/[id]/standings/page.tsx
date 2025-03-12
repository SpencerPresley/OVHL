import { notFound } from 'next/navigation';

// Secondary Nav
import { LeagueNav } from '@/components/league-nav';

// Page Components
import { LeagueBanner } from './components/league-banner';
import { DivisionTable } from './components/division-table';

// Types
import { League } from './types';

// Utils
import { fetchStandings } from './utils/fetch-standings';

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
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const league = leagues[id.toLowerCase()];

  if (!league) {
    notFound();
  }

  // Fetch standings data server-side
  const standings = await fetchStandings(id);

  return (
    <div className="min-h-screen">
      <LeagueBanner league={league} />
      <LeagueNav leagueId={id} />

      {/* Standings Content */}
      <div className="container mx-auto px-4 py-8">
        {standings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl">No standings data available.</p>
          </div>
        ) : (
          standings.map((divisionStandings) => (
            <DivisionTable
              key={divisionStandings.division}
              division={divisionStandings.division}
              teams={divisionStandings.teams}
              leagueId={id}
            />
          ))
        )}
      </div>
    </div>
  );
}
