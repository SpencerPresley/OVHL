import Image from 'next/image';
import Link from 'next/link';
import { LeagueNav } from '@/components/league-nav';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface PostHeaderProps {
  league: League;
}

export function PostHeader({ league }: PostHeaderProps) {
  return (
    <>
      <div className={`w-full ${league.bannerColor} py-8`}>
        <div className="container mx-auto px-4 flex items-center gap-8">
          <Image
            src={league.logo}
            alt={`${league.name} Logo`}
            width={80}
            height={80}
            className="object-contain"
          />
          <Link
            href={`/leagues/${league.id}/forum`}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            {league.name} Forum
          </Link>
        </div>
      </div>
      <LeagueNav leagueId={league.id} />
    </>
  );
}