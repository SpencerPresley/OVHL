import { TeamSalaryCard } from '../team-salary-card';
import { Team } from '../../types';

// interface Team {
//   id: string;
//   name: string;
//   identifier: string;
//   managers: any[];
//   stats: {
//     wins: number;
//     losses: number;
//     otLosses: number;
//   };
//   roster: {
//     forwards: number;
//     defense: number;
//     goalies: number;
//   };
//   salary: {
//     current: number;
//     cap: number;
//   };
// }

interface TeamSalariesTabProps {
  teams: Team[];
  leagueId: string;
}

export function TeamSalariesTab({ teams, leagueId }: TeamSalariesTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teams.map((team) => (
          <TeamSalaryCard key={team.id} team={team} leagueId={leagueId} />
        ))}
      </div>
    </div>
  );
}