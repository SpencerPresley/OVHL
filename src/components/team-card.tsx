import Image from 'next/image';
import Link from 'next/link';
import { Team } from '@/types/team';

export default function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <div className="card-gradient p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200">
        <div className="flex items-center space-x-4">
          <Image
            src={team.logo}
            alt={`${team.name} Logo`}
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <h3 className="text-xl font-semibold text-white">{team.name}</h3>
            <p className="text-gray-300">{team.city}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
