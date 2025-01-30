import { Nav } from '@/components/nav';
import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { default as dynamicImport } from 'next/dynamic';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

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

  // Attempt to get authenticated user for chat functionality
  console.log('LeaguePage: Getting auth token');
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  console.log('LeaguePage: Token found:', !!token);

  let currentUser = null;
  if (token?.value) {
    try {
      console.log('LeaguePage: Verifying token');
      const decoded = verify(token.value, process.env.JWT_SECRET!) as { id: string };
      console.log('LeaguePage: Token verified, getting user');

      currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
        },
      });
      console.log('LeaguePage: User found:', !!currentUser);
    } catch (error) {
      console.error('LeaguePage: Error verifying token:', error);
    }
  }

  console.log('LeaguePage: Rendering page');

  return (
    <div className="min-h-screen">
      <Nav />

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
            {/* Add stats content */}
          </div>
        </div>
      </div>
    </div>
  );
}
