import Image from 'next/image';
import { Users, Calendar } from 'lucide-react';
import type { PSNProfileData } from '../../types/psn-types';
import { formatDate, getLargeAvatar } from '../../utils/psn-formatters';

interface PSNProfileOverviewProps {
  profile: PSNProfileData;
}

export function PSNProfileOverview({ profile }: PSNProfileOverviewProps) {
  const largeAvatar = getLargeAvatar(profile.avatars);

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6">
      <div className="flex-shrink-0">
        {largeAvatar && (
          <Image
            src={largeAvatar.url}
            alt={`${profile.onlineId} avatar`}
            width={80}
            height={80}
            className="rounded-lg border-2 border-blue-500"
          />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold flex items-center gap-2">
          {profile.onlineId}
          {profile.isPlus && (
            <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">PS+</span>
          )}
        </h3>

        {profile.aboutMe && <p className="text-sm text-gray-300">{profile.aboutMe}</p>}

        <div className="flex gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{profile.friendsCount || 0} friends</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Last sync: {formatDate(profile.lastProfileSync)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
