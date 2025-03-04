import Image from 'next/image';
import { League } from '../types/league';

export default function LeagueBanner({ league }: { league: League }) {
  return (
    <div className={`${league.bannerColor} w-full h-48 flex items-center justify-center relative`}>
      <div className="absolute inset-0 bg-noise opacity-50"></div>
      <Image
        src={league.logo}
        alt={`${league.name} Logo`}
        width={200}
        height={200}
        className="z-10"
      />
    </div>
  );
}
