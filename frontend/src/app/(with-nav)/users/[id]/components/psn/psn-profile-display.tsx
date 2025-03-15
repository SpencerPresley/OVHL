import { Card, CardContent } from '@/components/ui/card';
import type { PSNProfileData } from '../../types/psn-types';
import { PSNProfileHeader } from './psn-profile-header';
import { PSNProfileOverview } from './psn-profile-overview';
import { PSNTrophySection } from './psn-trophy-section';
import { PSNGamesSection } from './psn-games-section';

interface PSNProfileDisplayProps {
  profile: PSNProfileData | null;
}

export function PSNProfileDisplay({ profile }: PSNProfileDisplayProps) {
  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl mb-6">
      <PSNProfileHeader profile={profile} />

      {profile && (
        <CardContent>
          <PSNProfileOverview profile={profile} />

          {profile.trophy && <PSNTrophySection trophy={profile.trophy} />}

          {profile.games.length > 0 && <PSNGamesSection games={profile.games} />}
        </CardContent>
      )}
    </Card>
  );
}
