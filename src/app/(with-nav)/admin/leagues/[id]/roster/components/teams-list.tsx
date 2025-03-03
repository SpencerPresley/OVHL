import { TeamRosterCard } from './team-roster-card';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamsListProps {
  teams: {
    id: string;
    officialName: string;
    teamIdentifier: string;
    roster: {
      forwards: number;
      defense: number;
      goalies: number;
    };
  }[];
  leagueId: string;
  onManageTeam: (teamId: string) => void;
  loading?: boolean;
}

export function TeamsList({ teams, leagueId, onManageTeam, loading }: TeamsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Teams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <TeamRosterCard
            key={team.id}
            team={team}
            leagueId={leagueId}
            onManageClick={onManageTeam}
          />
        ))}
      </div>
    </div>
  );
}
