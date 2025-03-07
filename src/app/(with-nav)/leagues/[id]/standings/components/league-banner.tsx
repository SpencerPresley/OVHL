import Image from 'next/image';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface LeagueBannerProps {
  league: League;
}

export function LeagueBanner({ league }: LeagueBannerProps) {
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
          <h1 className="text-4xl font-bold text-white">{league.name} Standings</h1>
        </div>
      </div>
    </div>
  );
}