import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Generate a verification code for PSN or Xbox integration via the security service
 * 
 * @route POST /api/integrations/generateCode
 * @body { platform: 'psn'|'xbox', username: string }
 * @returns { code: string }
 */
export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await requireAuth();
    
    // Parse the request body
    const { platform, username } = await request.json();
    
    // Validate the request
    if (!platform || !username) {
      return NextResponse.json(
        { error: 'Platform and username are required' },
        { status: 400 }
      );
    }
    
    if (platform !== 'psn' && platform !== 'xbox') {
      return NextResponse.json(
        { error: 'Invalid platform. Supported platforms: psn, xbox' },
        { status: 400 }
      );
    }
    
    // Get the security API URL from env
    const securityApiUrl = process.env.NEXT_PUBLIC_SECURITY_DEV_API;
    if (!securityApiUrl) {
      throw new Error('Security API URL not configured');
    }
    
    // Convert platform to the expected format for the security API and our database
    const platformSystem = platform === 'psn' ? 'PS' : 'XBOX';
    
    // Call the security service to generate a verification code
    const securityResponse = await fetch(`${securityApiUrl}/platform-verification/generate-code/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: platformSystem,
        gamertag: username,
        masked_user_id: user.id,
      }),
    });
    
    if (!securityResponse.ok) {
      const errorData = await securityResponse.json();
      throw new Error(errorData.detail || 'Failed to generate code from security service');
    }
    
    const codeData = await securityResponse.json();
    const code = codeData.code;
    
    // Check if the user already has a verified gamertag for this platform
    try {
      // First check if the user has a Player record
      const player = await prisma.player.findUnique({
        where: { id: user.id }
      });
      
      // If no player record exists yet, create one
      const playerId = player ? player.id : user.id;
      
      if (!player) {
        await prisma.player.create({
          data: {
            id: user.id,
            ea_id: 'placeholder', // Required field, will be updated later
            name: user.name || username,
            activeSystem: platformSystem,
          }
        });
      }
      
      // Check if this gamertag is already verified
      const existingVerifiedGamertag = await prisma.gamertagHistory.findFirst({
        where: {
          playerId: user.id,
          system: platformSystem,
          isVerified: true
        }
      });
      
      if (existingVerifiedGamertag) {
        return NextResponse.json(
          { error: `You already have a verified ${platform.toUpperCase()} gamertag` },
          { status: 400 }
        );
      }
      
      // Set the code expiration time - 10 minutes for testing
      const codeExpiresAt = new Date();
      codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 10);
      
      // Update or create the integration record
      await prisma.gamertagHistory.upsert({
        where: {
          playerId_system: {
            playerId: user.id,
            system: platformSystem
          }
        },
        create: {
          playerId: user.id,
          system: platformSystem,
          gamertag: username,
          verificationCode: code,
          verificationStatus: 'PENDING',
          isVerified: false,
          codeGeneratedAt: new Date(),
          codeExpiresAt: codeExpiresAt,
          verificationAttempts: 0
        },
        update: {
          gamertag: username,
          verificationCode: code,
          verificationStatus: 'PENDING',
          isVerified: false,
          codeGeneratedAt: new Date(),
          codeExpiresAt: codeExpiresAt,
          verificationAttempts: 0
        }
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Continue even if database operation fails, we want to return the code
    }
    
    return NextResponse.json({ code });
  } catch (error) {
    console.error('Failed to generate integration code:', error);
    return NextResponse.json(
      { error: 'Failed to generate integration code' },
      { status: 500 }
    );
  }
} 