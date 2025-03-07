import { notFound } from 'next/navigation';
import { LeagueNav } from '@/components/league-nav';
import { LeagueBanner } from './components/league-banner';
import { StatsContent } from './components/stats-content';
// Fetch ALL stats categories at once on the server
import { fetchStats } from './utils/fetch-stats';
import { League, PlayerStats, GoalieStats, TeamStats } from './types';

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

export default async function StatsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const league = leagues[id.toLowerCase()];

  if (!league) {
    notFound();
  }
  
  // Fix: Add proper type parameters to fetchStats calls
  const playerStats = await fetchStats<PlayerStats>(id, 'players');
  const goalieStats = await fetchStats<GoalieStats>(id, 'goalies');
  const teamStats = await fetchStats<TeamStats>(id, 'teams');
  
  return (
    <div className="min-h-screen">
      <LeagueBanner league={league} />
      <LeagueNav leagueId={id} />

      <div className="container mx-auto px-4 py-8">
        <StatsContent 
          leagueId={id}
          playerStats={playerStats}
          goalieStats={goalieStats}
          teamStats={teamStats}
        />
      </div>
    </div>
  );
}