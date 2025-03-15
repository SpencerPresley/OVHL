import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Get all verified and pending platform integrations for the authenticated user
 *
 * @route GET /api/integrations
 * @returns { integrations: Array<Object> }
 */
export async function GET() {
  try {
    // Authenticate user
    const user = await requireAuth();

    // Check if the user has a Player record
    const player = await prisma.player.findUnique({
      where: { id: user.id },
    });

    // If no player record exists, return empty array
    if (!player) {
      return NextResponse.json({ integrations: [] });
    }

    // Get all gamertag records for this player
    const gamertags = await prisma.gamertagHistory.findMany({
      where: {
        playerId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the integration data for the frontend
    const integrations = gamertags.map((tag) => {
      // Convert system to platform format expected by the frontend
      const platform = tag.system === 'PS' ? 'psn' : 'xbox';

      return {
        id: `${tag.playerId}_${tag.system}`,
        platform,
        username: tag.gamertag,
        verificationStatus: tag.verificationStatus,
        isVerified: tag.isVerified,
        verifiedAt: tag.verifiedAt,
        verificationCode: tag.verificationCode,
        codeGeneratedAt: tag.codeGeneratedAt,
        codeExpiresAt: tag.codeExpiresAt,
        updatedAt: tag.updatedAt,
      };
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Failed to fetch integrations:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}
