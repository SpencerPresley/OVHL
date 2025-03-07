import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import type { CareerStats } from '@/lib/services/user-service';

interface ProfileBannerProps {
    initials: string;
    currentGamertag: string;
    system: string;
    currentContract: number;
    careerStats: CareerStats;
    avatarUrl?: string | null;
}

export function ProfileBanner({
    initials,
    currentGamertag,
    system,
    currentContract,
    careerStats,
    avatarUrl,
}: ProfileBannerProps) {
    return (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 mb-8 text-white">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{currentGamertag}</h1>
            <p className="text-gray-300">{system}</p>
            <p className="text-gray-300">Contract: ${currentContract.toLocaleString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-8">
          <div>
            <p className="text-gray-400">Games Played</p>
            <p className="text-2xl font-bold">{careerStats.gamesPlayed}</p>
          </div>
          <div>
            <p className="text-gray-400">Goals</p>
            <p className="text-2xl font-bold">{careerStats.goals}</p>
          </div>
          <div>
            <p className="text-gray-400">Points</p>
            <p className="text-2xl font-bold">{careerStats.points}</p>
          </div>
          <div>
            <p className="text-gray-400">+/-</p>
            <p className="text-2xl font-bold">{careerStats.plusMinus}</p>
          </div>
        </div>
      </div>
    );
}