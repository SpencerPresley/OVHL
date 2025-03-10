import Link from 'next/link';
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
  return (
    <>
      <Link
        href={`/leagues/${league.id}/teams/${teamSeason.team.teamIdentifier}`}
        className="text-2xl hover:opacity-75"
      >
        {teamSeason.team.officialName}
      </Link>
      <div className="flex justify-between items-center mt-2">
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
