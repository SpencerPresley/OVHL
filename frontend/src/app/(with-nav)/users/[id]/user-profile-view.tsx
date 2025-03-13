"use client";

import {
  UserService,
  type UserProfileResponse,
  type FormattedUserProfile,
  type PlayerProfile,
} from '@/lib/services/user-service';
import { useState, useEffect } from 'react';

// Page parts
import { NoPlayerProfile } from './components/no-player-profile';
import { ProfileBanner } from './components/profile-banner';
import { SeasonStatsCard } from './components/season-stats-card';
import { PSNProfilePublicView } from './PSNProfilePublicView';

interface UserProfileViewProps {
  user: UserProfileResponse;
  psnProfile?: any;
}

function isPlayerProfile(profile: FormattedUserProfile): profile is PlayerProfile {
  return profile.hasPlayer;
}

export function UserProfileView({ user, psnProfile }: UserProfileViewProps) {
  const profileData = UserService.formatUserProfileData(user);
  const [psnProfileData, setPsnProfileData] = useState(psnProfile);
  const [isLoading, setIsLoading] = useState(!psnProfile);

  useEffect(() => {
    const fetchPSNProfile = async () => {
      if (psnProfile || !user || !user.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${user.id}/psn`);
        
        if (response.ok) {
          const data = await response.json();
          setPsnProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching PSN profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPSNProfile();
  }, [user, psnProfile]);

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

        {/* PSN Profile */}
        {!isLoading && (
          <div className="mt-6">
            <PSNProfilePublicView profile={psnProfileData} />
          </div>
        )}

        {/* Season Stats */}
        {player.seasons.map((season, index) => (
          <SeasonStatsCard key={index} season={season} />
        ))}
      </div>
    </div>
  );
}
