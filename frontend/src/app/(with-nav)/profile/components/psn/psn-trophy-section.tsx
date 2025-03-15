import { Trophy } from 'lucide-react';
import type { TrophyData } from '../../types/psn-types';

interface PSNTrophySectionProps {
  trophy: TrophyData;
}

export function PSNTrophySection({ trophy }: PSNTrophySectionProps) {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Trophy Level: {trophy.trophyLevel}
        <div className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
          {trophy.progress || 0}% to next level
        </div>
      </h3>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-yellow-400 font-semibold">{trophy.platinumCount || 0}</div>
          <div className="text-xs text-gray-400">Platinum</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-yellow-200 font-semibold">{trophy.goldCount || 0}</div>
          <div className="text-xs text-gray-400">Gold</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-300 font-semibold">{trophy.silverCount || 0}</div>
          <div className="text-xs text-gray-400">Silver</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-amber-700 font-semibold">{trophy.bronzeCount || 0}</div>
          <div className="text-xs text-gray-400">Bronze</div>
        </div>
      </div>
    </div>
  );
}
