import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Get PSN profile data for a specific user by ID
 * 
 * @route GET /api/users/[id]/psn
 * @returns PSN profile data including avatar, games, and trophies
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get PSN profile data
    const profile = await prisma.pSNProfile.findUnique({
      where: { 
        userId: userId 
      },
      include: {
        avatars: true,
      }
    });
    
    if (!profile) {
      // Return a success response with null profile
      // This indicates the user exists but doesn't have a PSN profile
      return NextResponse.json(null);
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