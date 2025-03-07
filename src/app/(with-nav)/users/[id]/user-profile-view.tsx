import {
  UserService,
  type UserProfileResponse,
  type FormattedUserProfile,
  type PlayerProfile,
} from '@/lib/services/user-service';

// Page parts
import { NoPlayerProfile } from './components/no-player-profile';
import { ProfileBanner } from './components/profile-banner';
import { SeasonStatsCard } from './components/season-stats-card';

interface UserProfileViewProps {
  user: UserProfileResponse;
}

function isPlayerProfile(profile: FormattedUserProfile): profile is PlayerProfile {
  return profile.hasPlayer;
}

export function UserProfileView({ user }: UserProfileViewProps) {
  const profileData = UserService.formatUserProfileData(user);

  if (!isPlayerProfile(profileData)) {
    return <NoPlayerProfile />;
  }

  const {
    currentGamertag,
    initials,
    system,
    currentContract,
    careerStats,
    user: { player, avatarUrl },
  } = profileData;

  return (
    <div>
      <div className="container mx-auto py-8">
        <ProfileBanner
          initials={initials}
          currentGamertag={currentGamertag}
          system={system}
          currentContract={currentContract}
          careerStats={careerStats}
          avatarUrl={avatarUrl}
        />

        {/* Season Stats */}
        {player.seasons.map((season, index) => (
          <SeasonStatsCard key={index} season={season} />
        ))}
      </div>
    </div>
  );
}
