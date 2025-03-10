import Image from 'next/image';
import { League } from '../types/league';

/**
 * LeagueBannerTeams Component
 *
 * Displays the league banner with the league logo and name
 * Uses league-specific banner color for branding
 */
export function LeagueBannerTeams({ league }: { league: League }) {
  return (
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
          <h1 className="text-4xl font-bold text-white">{league.name} Teams</h1>
        </div>
      </div>
    </div>
  );
}
