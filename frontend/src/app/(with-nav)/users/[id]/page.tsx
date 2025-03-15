import React from 'react';
import { notFound } from 'next/navigation';
import { UserProfileView } from './user-profile-view';
import { UserService } from '@/lib/services/user-service';
import { prisma } from '@/lib/prisma';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const user = await UserService.getUserById(id);

  if (!user) {
    notFound();
  }

  // Fetch PSN profile data server-side
  let psnProfile = null;
  try {
    // Get PSN profile data from database directly
    const profile = await prisma.pSNProfile.findUnique({
      where: {
        userId: id,
      },
      include: {
        avatars: true,
      },
    });

    if (profile) {
      // Get trophy data
      const trophyData = await prisma.pSNTrophy.findUnique({
        where: { profileId: profile.id },
      });

      // Get games data (limited to last 100 for performance)
      const games = await prisma.pSNGame.findMany({
        where: { profileId: profile.id },
        orderBy: { lastPlayed: 'desc' },
        take: 100,
      });

      psnProfile = {
        id: profile.id,
        onlineId: profile.onlineId,
        accountId: profile.accountId,
        aboutMe: profile.aboutMe,
        languages: profile.languages,
        isPlus: profile.isPlus,
        isOfficiallyVerified: profile.isOfficiallyVerified,
        friendsCount: profile.friendsCount,
        mutualFriendsCount: profile.mutualFriendsCount,
        friendRelation: profile.friendRelation,
        onlineStatus: profile.onlineStatus,
        platform: profile.platform,
        lastProfileSync: profile.lastProfileSync,
        lastTrophySync: profile.lastTrophySync,
        lastGameSync: profile.lastGameSync,
        avatars: profile.avatars.map((avatar) => ({
          size: avatar.size,
          url: avatar.url,
        })),
        trophy: trophyData
          ? {
              trophyLevel: trophyData.trophyLevel,
              progress: trophyData.progress,
              tier: trophyData.tier,
              platinumCount: trophyData.platinumCount,
              goldCount: trophyData.goldCount,
              silverCount: trophyData.silverCount,
              bronzeCount: trophyData.bronzeCount,
              totalTrophies: trophyData.totalTrophies,
            }
          : null,
        games: games.map((game) => ({
          id: game.id,
          name: game.name,
          platform: game.platform,
          imageUrl: game.imageUrl,
          playCount: game.playCount,
          playTimeMinutes: game.playTimeMinutes,
          firstPlayed: game.firstPlayed ? game.firstPlayed.toISOString() : null,
          lastPlayed: game.lastPlayed ? game.lastPlayed.toISOString() : null,
          playDuration: game.playDuration,
        })),
      };
    }
  } catch (error) {
    console.error('Failed to fetch PSN profile data:', error);
  }

  return <UserProfileView user={user} psnProfile={psnProfile} />;
}
