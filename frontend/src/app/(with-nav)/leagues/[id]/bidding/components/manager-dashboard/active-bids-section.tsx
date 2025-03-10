import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '../countdown-timer';
import { ActiveBid } from '../../types';

// interface ActiveBid {
//   playerSeasonId: string;
//   playerName: string;
//   position: string;
//   amount: number;
//   endTime: number;
// }

interface ActiveBidsSectionProps {
  activeBids: ActiveBid[];
}

export function ActiveBidsSection({ activeBids }: ActiveBidsSectionProps) {
  if (!activeBids || activeBids.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Active Bids</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeBids.map((bid) => (
          <div key={bid.playerSeasonId} className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{bid.playerName}</div>
                <div className="text-sm text-gray-400">{bid.position}</div>
              </div>
              <Badge variant="outline" className="bg-blue-900/50 text-blue-400 border-blue-400/30">
                ${bid.amount.toLocaleString()}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Ends in: <CountdownTimer endTime={bid.endTime} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
