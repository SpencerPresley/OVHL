import { Separator } from '@/components/ui/separator';
import { PlayerCard } from './player-card';
import { getPositionColor } from '../utils/position-utils';

interface PlayerPositionSectionProps {
  title: string;
  players: Array<{
    id: string;
    name: string;
    position: string;
    system: any;
    gamertag: string;
    gamesPlayed: number;
    goals: number;
    assists: number;
    points: number;
    plusMinus: number;
    contract: {
      amount: number;
    };
    isManager: boolean;
  }>;
  showSeparator?: boolean;
}

export function PlayerPositionSection({
  title,
  players,
  showSeparator = true,
}: PlayerPositionSectionProps) {
  if (players.length === 0) return null;

  return (
    <>
      {showSeparator && <Separator className="my-8" />}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} getPositionColor={getPositionColor} />
          ))}
        </div>
      </div>
    </>
  );
}
