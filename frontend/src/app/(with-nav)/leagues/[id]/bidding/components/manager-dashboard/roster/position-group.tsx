import { Badge } from '@/components/ui/badge';
import { PlayerPositionGroup, ActivePlayerInfo } from '../../../types';

// interface Player {
//   id: string;
//   name: string;
//   position: string;
//   gamertag: string;
//   contractAmount: number;
// }

// interface ActivePlayerInfo {
//   gamertag: string;
//   currentTeamId: string | null;
// }

interface PositionGroupProps {
  position: string;
  title: string;
  titleColor: string;
  players: PlayerPositionGroup[];
  managedTeamId: string;
  activePlayers: ActivePlayerInfo[];
}

export function PositionGroup({
  position,
  title,
  titleColor,
  players,
  managedTeamId,
  activePlayers,
}: PositionGroupProps) {
  return (
    <div className="bg-gray-800/40 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-700/50">
        <h5 className={`text-sm font-medium ${titleColor}`}>{title}</h5>
        <span className="text-xs">{players.length}</span>
      </div>

      <div className="space-y-2">
        {players.map((player) => {
          // Check if player has an active bid from any team
          const activePlayerBid = activePlayers.find((p) => p.gamertag === player.gamertag);
          const hasActiveBid = !!activePlayerBid;
          // Check if this team has a bid on the player
          const hasTeamBid = hasActiveBid && activePlayerBid?.currentTeamId === managedTeamId;

          return (
            <div key={player.id} className="flex justify-between items-center">
              <div className="flex-1">
                <div className="font-medium text-sm flex items-center">
                  {player.gamertag}
                  {hasActiveBid && (
                    <Badge
                      variant="outline"
                      className={`ml-2 text-xs py-0 h-4 ${hasTeamBid ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}
                    >
                      {hasTeamBid ? 'Your Bid' : 'Has Bid'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-xs font-mono text-gray-400">
                ${player.contractAmount.toLocaleString()}
              </div>
            </div>
          );
        })}
        {players.length === 0 && <div className="text-xs text-gray-500 italic">No players</div>}
      </div>
    </div>
  );
}
