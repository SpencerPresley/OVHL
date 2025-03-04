import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { default as dynamicImport } from 'next/dynamic';
import { PrismaClient } from '@prisma/client';
import { LeagueQuickStats } from '@/components/league-quick-stats';
import { serverAuth } from '@/lib/auth';

// Use nodejs runtime to avoid edge runtime issues with crypto
export const runtime = 'nodejs';

// Force dynamic to ensure real-time updates
export const revalidate = 0;

const prisma = new PrismaClient();

/**
 * Dynamic import of the chat component with loading state
 * Using dynamic import to avoid SSR issues with WebSocket connections
 */
const ClientChat = dynamicImport(() => import('@/components/chatbox/client-wrapper'), {
  loading: () => <div className="animate-pulse bg-gray-700 h-[400px] rounded-lg"></div>,
});

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getLeagueStats(leagueId: string) {
  // Get the latest season
  const season = await prisma.season.findFirst({
    where: { isLatest: true },
  });

  if (!season) return null;

  // Get the tier for this league
  const tier = await prisma.tier.findFirst({
    where: {
      seasonId: season.id,
      name: leagueId.toUpperCase(),
    },
  });

  if (!tier) return null;

  // Get all player stats in this tier
  const players = await prisma.playerTeamSeason.findMany({
    where: {
      teamSeason: {
        tierId: tier.id,
      },
    },
    include: {
      playerSeason: {
        include: {
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
      teamSeason: {
        include: {
          team: true,
        },
      },
    },
    orderBy: [{ goals: 'desc' }, { assists: 'desc' }],
  });

  // Get team stats
  const teamSeasons = await prisma.teamSeason.findMany({
    where: {
      tierId: tier.id,
    },
    include: {
      team: true,
    },
  });

  // Transform team stats
  const transformedTeams = teamSeasons.map((t) => ({
    id: t.team.id,
    name: t.team.officialName,
    teamIdentifier: t.team.teamIdentifier,
    wins: t.wins,
    powerplayGoals: t.powerplayGoals,
    powerplayOpportunities: t.powerplayOpportunities,
    penaltyKillGoalsAgainst: t.penaltyKillGoalsAgainst,
    penaltyKillOpportunities: t.penaltyKillOpportunities,
  }));

  // Transform and sort the data
  const transformedPlayers = players.map((p) => ({
    id: p.playerSeason.player.id,
    name: p.playerSeason.player.name,
    gamertag: p.playerSeason.player.gamertags[0]?.gamertag || p.playerSeason.player.name,
    teamIdentifier: p.teamSeason.team.teamIdentifier,
    goals: p.goals,
    assists: p.assists,
    points: p.goals + p.assists,
    plusMinus: p.plusMinus,
    saves: p.saves,
    goalsAgainst: p.goalsAgainst,
    gamesPlayed: p.gamesPlayed,
  }));

  return {
    points: [...transformedPlayers]
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        gamertag: p.gamertag,
        teamIdentifier: p.teamIdentifier,
        value: p.points,
      })),
    goals: [...transformedPlayers]
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        gamertag: p.gamertag,
        teamIdentifier: p.teamIdentifier,
        value: p.goals,
      })),
    assists: [...transformedPlayers]
      .sort((a, b) => b.assists - a.assists)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        gamertag: p.gamertag,
        teamIdentifier: p.teamIdentifier,
        value: p.assists,
      })),
    plusMinus: [...transformedPlayers]
      .sort((a, b) => b.plusMinus - a.plusMinus)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        gamertag: p.gamertag,
        teamIdentifier: p.teamIdentifier,
        value: p.plusMinus,
      })),
    savePercentage: [...transformedPlayers]
      .filter((p) => p.saves !== null && p.goalsAgainst !== null)
      .map((p) => ({
        id: p.id,
        name: p.name,
        gamertag: p.gamertag,
        teamIdentifier: p.teamIdentifier,
        value: p.saves! / (p.saves! + p.goalsAgainst!),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
    gaa: [...transformedPlayers]
      .filter((p) => p.goalsAgainst !== null && p.gamesPlayed > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        gamertag: p.gamertag,
        teamIdentifier: p.teamIdentifier,
        value: p.goalsAgainst! / p.gamesPlayed, // GAA is already per game, no need to multiply
      }))
      .sort((a, b) => a.value - b.value) // Sort ascending since lower GAA is better
      .slice(0, 10),
    teamWins: [...transformedTeams]
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10)
      .map((t) => ({
        id: t.id,
        name: t.name,
        gamertag: t.teamIdentifier,
        teamIdentifier: t.teamIdentifier,
        value: t.wins,
      })),
    teamPowerPlay: [...transformedTeams]
      .filter((t) => t.powerplayOpportunities > 0)
      .map((t) => ({
        id: t.id,
        name: t.name,
        gamertag: t.teamIdentifier,
        teamIdentifier: t.teamIdentifier,
        value: t.powerplayGoals / t.powerplayOpportunities,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
    teamPenaltyKill: [...transformedTeams]
      .filter((t) => t.penaltyKillOpportunities > 0)
      .map((t) => ({
        id: t.id,
        name: t.name,
        gamertag: t.teamIdentifier,
        teamIdentifier: t.teamIdentifier,
        value: 1 - t.penaltyKillGoalsAgainst / t.penaltyKillOpportunities,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
  };
}

/**
 * League Page Component
 *
 * A dynamic page that displays league-specific content including:
 * - Dynamic banner with league-specific colors
 * - League logo display
 * - League name
 * - Real-time chat for authenticated users
 * - News and stats sections
 *
 * Authentication:
 * - Chat is only available to authenticated users with a valid name
 * - Non-authenticated users can still view the page but see a sign-in prompt for chat
 * - Uses JWT token from cookies for authentication
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.params - URL parameters
 * @param {string} props.params.id - League ID from the URL
 * @returns {Promise<JSX.Element>} Rendered league page
 */
export default async function LeaguePage({ params }: { params: { id: string } }) {
  console.log('LeaguePage: Starting to load', params);

  const { id } = await Promise.resolve(params);
  const league = leagues[id];

  console.log('LeaguePage: Found league:', league);

  if (!league) {
    console.log('LeaguePage: League not found, redirecting to 404');
    notFound();
  }

  let currentUser = null;

  // Get authenticated user with unified auth utility
  try {
    console.log('LeaguePage: Checking authentication');
    const user = await serverAuth();

    if (user) {
      console.log('LeaguePage: User authenticated, getting full user data');
      currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
        },
      });
      console.log('LeaguePage: User found:', !!currentUser);
    }
  } catch (error) {
    console.error('LeaguePage: Auth error:', error);
  }

  console.log('LeaguePage: Rendering page');

  return (
    <div className="min-h-screen">
      {/* Nav removed - handled by parent layout */}

      {/* League Banner */}
      <div className={`w-full ${league.bannerColor} py-8`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Image
              src={league.logo}
              alt={`${league.name} Logo`}
              width={80}
              height={80}
              className="object-contain"
            />
            <h1 className="text-4xl font-bold text-white">{league.name}</h1>
          </div>
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* League Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Chat Section - Full width on larger screens */}
        <div className="w-full">
          {currentUser && currentUser.name ? (
            <ClientChat
              leagueId={league.id}
              currentUser={{
                id: currentUser.id,
                name: currentUser.name,
              }}
            />
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">Please sign in to participate in the chat.</p>
            </div>
          )}
        </div>

        {/* News and Stats Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card-gradient rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Recent News</h2>
            {/* Add news content */}
          </div>
          <div className="card-gradient rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Stats</h2>
            <LeagueQuickStats leagueId={league.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
