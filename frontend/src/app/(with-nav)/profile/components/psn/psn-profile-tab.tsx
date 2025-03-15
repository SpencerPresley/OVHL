'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { PSNProfileData } from '../../types/psn-types';
import { PSNProfileHeader } from './psn-profile-header';
import { PSNProfileOverview } from './psn-profile-overview';
import { PSNTrophySection } from './psn-trophy-section';
import { PSNGamesSection } from './psn-games-section';
import { PSNProfileSkeleton } from './psn-profile-skeleton';
import { PSNProfileError } from './psn-profile-error';

export function PSNProfileTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<PSNProfileData | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    const fetchPSNProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/psn/profile');

        if (!response.ok) {
          throw new Error('Server error when fetching PSN profile');
        }

        const data = await response.json();

        // Check if the response indicates the profile is not verified/doesn't exist
        if (data.verified === false) {
          setNeedsVerification(true);
          setError(
            data.message ||
              'PSN profile not found. Please connect your account in the Integrations tab.'
          );
        } else {
          setProfileData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PSN profile');
        console.error('Error fetching PSN profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPSNProfile();
  }, []);

  if (loading) {
    return <PSNProfileSkeleton />;
  }

  if (error || !profileData) {
    return (
      <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
        <PSNProfileError error={error} needsVerification={needsVerification} />
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
      <PSNProfileHeader />
      <CardContent>
        <PSNProfileOverview profile={profileData} />

        {profileData.trophy && <PSNTrophySection trophy={profileData.trophy} />}

        <PSNGamesSection games={profileData.games} />
      </CardContent>
    </Card>
  );
}
