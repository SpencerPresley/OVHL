import { Nav } from "@/components/nav";
import { LeagueNav } from "@/components/league-nav";
import Image from "next/image";
import { notFound } from "next/navigation";

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
    id: "nhl",
    name: "NHL",
    logo: "/nhl_logo.png",
    bannerColor: "bg-blue-900",
  },
  ahl: {
    id: "ahl",
    name: "AHL",
    logo: "/ahl_logo.png",
    bannerColor: "bg-yellow-400",
  },
  echl: {
    id: "echl",
    name: "ECHL",
    logo: "/echl_logo.png",
    bannerColor: "bg-emerald-600",
  },
  chl: {
    id: "chl",
    name: "CHL",
    logo: "/chl_logo.png",
    bannerColor: "bg-teal-600",
  },
};

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";

/**
 * League Page Component
 *
 * A dynamic page that displays league-specific content.
 * Features:
 * - Dynamic banner with league-specific colors
 * - League logo display
 * - League name
 * - Responsive design
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.params - URL parameters
 * @param {string} props.params.id - League ID from the URL
 * @returns {Promise<JSX.Element>} Rendered league page
 */
export default async function LeaguePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const league = leagues[id];

  if (!league) {
    notFound();
  }

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
      <div className="container mx-auto px-4 py-8">
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
