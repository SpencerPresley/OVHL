import { CountdownTimer } from './countdown-timer';

interface BiddingHeaderProps {
  biddingStatus: {
    active: boolean;
    lastUpdate: number;
    endTime?: number;
  } | null;
  onTimerEnd?: () => void;
}

export function BiddingHeader({ biddingStatus, onTimerEnd }: BiddingHeaderProps) {
  return (
    <div className="bg-gray-900/60 border-y border-gray-800">
      <div className="container mx-auto px-4 py-2 flex flex-col md:flex-row justify-between items-center">
        <div>
          <div className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                biddingStatus?.active ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-lg font-medium">
              Bidding {biddingStatus?.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {biddingStatus?.active && biddingStatus.lastUpdate && (
            <p className="text-sm text-gray-400">
              Updated {new Date(biddingStatus.lastUpdate).toLocaleTimeString()}
            </p>
          )}
        </div>
        {biddingStatus?.active && biddingStatus.endTime && (
          <div className="text-right">
            <p className="text-sm text-gray-400">Ends in:</p>
            <span className="text-xl font-mono">
              <CountdownTimer endTime={biddingStatus.endTime} onEnd={onTimerEnd} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}