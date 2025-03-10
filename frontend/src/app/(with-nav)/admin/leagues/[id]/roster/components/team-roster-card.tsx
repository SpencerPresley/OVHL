import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';

interface TeamRosterCardProps {
  team: {
    id: string;
    officialName: string;
    teamIdentifier: string;
    roster: {
      forwards: number;
      defense: number;
      goalies: number;
    };
  };
  leagueId: string;
  onManageClick: (teamId: string) => void;
}

export function TeamRosterCard({ team, leagueId, onManageClick }: TeamRosterCardProps) {
  // Get team data from the appropriate league
  const teamData = (() => {
    switch (leagueId.toLowerCase()) {
      case 'nhl':
        return NHL_TEAMS.find((t) => t.id === team.teamIdentifier.toLowerCase());
      case 'ahl':
        return AHL_TEAMS.find((t) => t.id === team.teamIdentifier.toLowerCase());
      case 'echl':
        return ECHL_TEAMS.find((t) => t.id === team.teamIdentifier.toLowerCase());
      case 'chl':
        return CHL_TEAMS.find((t) => t.id === team.teamIdentifier.toLowerCase());
      default:
        return null;
    }
  })();

  const style = teamData?.colors
    ? {
        background: `linear-gradient(to right, ${teamData.colors.primary}20, ${teamData.colors.secondary}30)`,
        borderLeft: `4px solid ${teamData.colors.primary}`,
      }
    : {};

  return (
    <Card className="bg-gray-800/50 border-white/10" style={style}>
      <CardHeader>
        <CardTitle className="text-lg">{teamData?.name || team.officialName}</CardTitle>
        <CardDescription className="text-gray-400">{team.teamIdentifier}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className="p-2 rounded-lg bg-black/20">
            <div className="text-xs text-muted-foreground">Forwards</div>
            <div
              className={cn('font-medium', {
                'text-green-500': team.roster.forwards >= 9,
                'text-yellow-500': team.roster.forwards >= 6,
                'text-red-500': team.roster.forwards < 6,
              })}
            >
              {team.roster.forwards}/9
            </div>
          </div>
          <div className="p-2 rounded-lg bg-black/20">
            <div className="text-xs text-muted-foreground">Defense</div>
            <div
              className={cn('font-medium', {
                'text-green-500': team.roster.defense >= 6,
                'text-yellow-500': team.roster.defense >= 4,
                'text-red-500': team.roster.defense < 4,
              })}
            >
              {team.roster.defense}/6
            </div>
          </div>
          <div className="p-2 rounded-lg bg-black/20">
            <div className="text-xs text-muted-foreground">Goalies</div>
            <div
              className={cn('font-medium', {
                'text-green-500': team.roster.goalies >= 2,
                'text-yellow-500': team.roster.goalies >= 1,
                'text-red-500': team.roster.goalies < 1,
              })}
            >
              {team.roster.goalies}/2
            </div>
          </div>
        </div>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => onManageClick(team.id)}
        >
          Manage Roster
        </Button>
      </CardContent>
    </Card>
  );
}
