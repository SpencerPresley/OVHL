import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Verify a PSN or Xbox integration by checking if the verification code 
 * exists in the user's profile
 * 
 * @route POST /api/integrations/verifyCode
 * @body { platform: 'psn'|'xbox', username: string, code: string }
 * @returns { success: boolean, message: string }
 */
export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await requireAuth();
    
    // Parse the request body
    const { platform, username, code } = await request.json();
    
    // Validate the request
    if (!platform || !username || !code) {
      return NextResponse.json(
        { error: 'Platform, username and code are required' },
        { status: 400 }
      );
    }
    
    if (platform !== 'psn' && platform !== 'xbox') {
      return NextResponse.json(
        { error: 'Invalid platform. Supported platforms: psn, xbox' },
        { status: 400 }
      );
    }
    
    // For now, Xbox verification is not supported
    if (platform === 'xbox') {
      return NextResponse.json(
        { error: 'Xbox verification is not yet supported' },
        { status: 400 }
      );
    }
    
    // Convert platform to the expected format for our database
    const platformSystem = platform === 'psn' ? 'PS' : 'XBOX';
    
    // First, check if we have a pending verification for this user and platform
    const pendingVerification = await prisma.gamertagHistory.findFirst({
      where: {
        playerId: user.id,
        system: platformSystem,
        verificationStatus: 'PENDING',
        isVerified: false,
      }
    });
    
    if (!pendingVerification) {
      return NextResponse.json({ 
        error: 'No pending verification found. Please generate a verification code first.' 
      }, { status: 400 });
    }
    
    // Check if the provided verification code matches
    if (pendingVerification.verificationCode !== code) {
      return NextResponse.json({ 
        error: 'Incorrect verification code.' 
      }, { status: 400 });
    }
    
    // Check if the code has expired
    if (pendingVerification.codeExpiresAt && new Date() > pendingVerification.codeExpiresAt) {
      return NextResponse.json({ 
        error: 'Verification code has expired. Please generate a new code.' 
      }, { status: 400 });
    }
    
    // Increment the verification attempts
    await prisma.gamertagHistory.update({
      where: {
        playerId_system: {
          playerId: user.id,
          system: platformSystem,
        }
      },
      data: {
        verificationAttempts: {
          increment: 1
        },
        lastAttemptAt: new Date(),
      }
    });
    
    // Get the PSN API URL from env
    const psnApiUrl = process.env.NEXT_PUBLIC_PSN_DEV_API;
    if (!psnApiUrl) {
      throw new Error('PSN API URL not configured');
    }
    
    // Only proceed with verification for PSN
    if (platform === 'psn') {
      try {
        // Call the PSN API to get the user's profile, specifically the about_me field
        const psnEndpoint = `${psnApiUrl}/users/${username}?fields=about_me`;
        console.log(`Calling PSN service at: ${psnEndpoint}`);
        
        const response = await fetch(psnEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log(`PSN API response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`PSN API error response: ${errorText}`);
          throw new Error(`Failed to fetch PSN profile: ${response.statusText}`);
        }
        
        const profileData = await response.json();
        console.log('PSN profile data received:', profileData);
        
        // Check if the about_me field contains the verification code
        if (profileData.about_me && profileData.about_me.includes(code)) {
          console.log(`Verification successful! Code ${code} found in about_me`);
          // Update the verification status
          await prisma.gamertagHistory.update({
            where: {
              playerId_system: {
                playerId: user.id,
                system: platformSystem,
              }
            },
            data: {
              verificationStatus: 'VERIFIED',
              isVerified: true,
              verifiedAt: new Date(),
              verificationMetadata: {
                verificationMethod: 'about_me',
                timestamp: new Date().toISOString()
              }
            }
          });
          
          // If this is the user's first verified gamertag, update their active system
          await prisma.player.update({
            where: {
              id: user.id
            },
            data: {
              activeSystem: platformSystem
            }
          });
          
          return NextResponse.json({
            success: true,
            message: `Your ${platform.toUpperCase()} account has been successfully verified!`
          });
        } else {
          return NextResponse.json({ 
            error: 'Verification code not found in your PSN profile. Please make sure you have added the code to your About Me section and try again.' 
          }, { status: 400 });
        }
      } catch (apiError) {
        console.error('PSN API error:', apiError);
        return NextResponse.json({ 
          error: 'Failed to verify profile. The PSN API may be temporarily unavailable or the profile may not exist.' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Unsupported platform for verification' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify integration' },
      { status: 500 }
    );
  }
} 