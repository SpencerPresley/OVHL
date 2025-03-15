import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';
import type { PSNProfileData } from '../../types/psn-types';

interface PSNProfileHeaderProps {
  profile: PSNProfileData | null;
}

export function PSNProfileHeader({ profile }: PSNProfileHeaderProps) {
  if (!profile) {
    return (
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          PlayStation Network
        </CardTitle>
        <CardDescription className="text-gray-300">
          This user has not connected their PSN account.
        </CardDescription>
      </CardHeader>
    );
  }

  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Gamepad2 className="h-5 w-5" />
        PlayStation Network Profile
      </CardTitle>
      <CardDescription className="text-gray-300">
        {profile.onlineId}
        {profile.isPlus && (
          <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
            PS+
          </span>
        )}
      </CardDescription>
    </CardHeader>
  );
}
