import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Get PSN profile data for the authenticated user
 * 
 * @route GET /api/psn/profile
 * @returns PSN profile data including avatar, games, and trophies
 */
export async function GET() {
  try {
    // Authenticate user
    const user = await requireAuth();
    
    // Get PSN profile data
    const profile = await prisma.pSNProfile.findUnique({
      where: { 
        userId: user.id 
      },
      include: {
        avatars: true,
      }
    });
    
    if (!profile) {
      // Return a specific response for users without a PSN profile
      // This differentiates from an error condition
      return NextResponse.json({
        verified: false,
        message: "No PSN profile found. Please connect your PSN account in the Integrations tab."
      }, { status: 200 });
    }
    
    // Get trophy data
    const trophyData = await prisma.pSNTrophy.findUnique({
      where: { profileId: profile.id }
    });
    
    // Get games data (limited to last 100 for performance)
    const games = await prisma.pSNGame.findMany({
      where: { profileId: profile.id },
      orderBy: { lastPlayed: 'desc' },
      take: 100,
    });
    
    // Format data for the response
    const responseData = {
      verified: true,
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
      syncEnabled: profile.syncEnabled,
      avatars: profile.avatars.map(avatar => ({
        size: avatar.size,
        url: avatar.url
      })),
      trophy: trophyData ? {
        trophyLevel: trophyData.trophyLevel,
        progress: trophyData.progress,
        tier: trophyData.tier,
        platinumCount: trophyData.platinumCount,
        goldCount: trophyData.goldCount,
        silverCount: trophyData.silverCount,
        bronzeCount: trophyData.bronzeCount,
        totalTrophies: trophyData.totalTrophies
      } : null,
      games: games.map(game => ({
        id: game.id,
        name: game.name,
        platform: game.platform,
        imageUrl: game.imageUrl,
        playCount: game.playCount,
        playTimeMinutes: game.playTimeMinutes,
        firstPlayed: game.firstPlayed ? game.firstPlayed.toISOString() : null,
        lastPlayed: game.lastPlayed ? game.lastPlayed.toISOString() : null,
        playDuration: game.playDuration,
        isCurrentlyPlaying: game.isCurrentlyPlaying
      }))
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Failed to fetch PSN profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PSN profile' },
      { status: 500 }
    );
  }
} 