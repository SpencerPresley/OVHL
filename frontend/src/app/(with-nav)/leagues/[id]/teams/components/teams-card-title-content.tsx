import Link from 'next/link';
import Image from 'next/image';
import { TeamSeason } from '../types/team-season';
import { League } from '../types/league';

interface TeamsCardTitleContentProps {
  teamSeason: TeamSeason;
  league: League;
  totalSalary: number;
  salaryCap: number;
  salaryColor: string;
}

export function TeamsCardTitleContent({
  teamSeason,
  league,
  totalSalary,
  salaryCap,
  salaryColor,
}: TeamsCardTitleContentProps) {
  const team = teamSeason.team;

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 flex-shrink-0">
          {team.logoPath ? (
            <Image
              src={team.logoPath}
              alt={`${team.fullTeamName} logo`}
              layout="fill"
              objectFit="contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-600 rounded-sm flex items-center justify-center text-xs font-bold text-gray-300">
              {team.teamAbbreviation}
            </div>
          )}
        </div>
        <Link
          href={`/leagues/${league.id}/teams/${team.teamAbbreviation}`}
          className="text-2xl font-semibold hover:opacity-75 flex-grow min-w-0 truncate"
        >
          {team.fullTeamName}
        </Link>
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="flex flex-col">
          <span className={`text-sm ${salaryColor}`}>
            ${totalSalary.toLocaleString()} / ${salaryCap.toLocaleString()}
          </span>
        </div>
        <span className="text-lg font-mono bg-secondary/50 px-3 py-1 rounded-md">
          {teamSeason.wins}-{teamSeason.losses}-{teamSeason.otLosses}
        </span>
      </div>
    </>
  );
}
