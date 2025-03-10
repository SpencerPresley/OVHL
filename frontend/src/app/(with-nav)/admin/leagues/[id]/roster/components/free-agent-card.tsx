import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FreeAgentCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    gamertag: string;
    contract: {
      amount: number;
    };
  };
  teams: {
    id: string;
    officialName: string;
    teamIdentifier: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  }[];
  onAddToTeam: (playerId: string, teamId: string) => void;
}

export function FreeAgentCard({ player, teams, onAddToTeam }: FreeAgentCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-white/10">
      <div className="flex items-center gap-4">
        <Badge
          variant="outline"
          className={cn('font-semibold bg-black/30', {
            'text-red-400 border-red-400/30': player.position === 'C',
            'text-green-400 border-green-400/30': player.position === 'LW',
            'text-blue-400 border-blue-400/30': player.position === 'RW',
            'text-teal-400 border-teal-400/30': player.position === 'LD',
            'text-yellow-400 border-yellow-400/30': player.position === 'RD',
            'text-purple-400 border-purple-400/30': player.position === 'G',
          })}
        >
          {player.position}
        </Badge>
        <div>
          <p className="font-medium">{player.name}</p>
          <p className="text-sm text-gray-400">{player.gamertag}</p>
        </div>
        <div className="text-sm text-gray-400">${player.contract.amount.toLocaleString()}</div>
      </div>
      <div className="flex items-center gap-2">
        <Select onValueChange={(value) => onAddToTeam(player.id, value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Add to team..." />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem
                key={team.id}
                value={team.id}
                className="flex items-center gap-2"
                style={
                  team.colors
                    ? {
                        background: `linear-gradient(to right, ${team.colors.primary}20, ${team.colors.secondary}30)`,
                        borderLeft: `4px solid ${team.colors.primary}`,
                      }
                    : {}
                }
              >
                {team.officialName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
