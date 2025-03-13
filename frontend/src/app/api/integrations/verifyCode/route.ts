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
          
          // Fetch additional PSN profile data and save it
          await savePSNProfileData(user.id, username, profileData);
          
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

/**
 * Helper function to save PSN profile data to the database
 */
async function savePSNProfileData(userId: string, onlineId: string, profileData: any) {
  try {
    console.log('Saving PSN profile data for user:', userId);
    
    const psnApiUrl = process.env.NEXT_PUBLIC_PSN_DEV_API;
    if (!psnApiUrl) {
      throw new Error('PSN API URL not configured');
    }
    
    // Create or update PSN profile record
    await prisma.pSNProfile.upsert({
      where: {
        userId: userId
      },
      create: {
        userId: userId,
        onlineId: onlineId,
        accountId: profileData.account_id || null,
        aboutMe: profileData.about_me || null,
        languages: profileData.languages || [],
        isPlus: profileData.is_plus || false,
        isOfficiallyVerified: profileData.is_officially_verified || false,
        friendsCount: profileData.friends_count || 0,
        mutualFriendsCount: profileData.mutual_friends_count || 0,
        friendRelation: profileData.friend_relation || null,
        isBlocking: profileData.is_blocking || false,
        onlineStatus: profileData.online_status || null,
        lastProfileSync: new Date(),
        syncEnabled: true
      },
      update: {
        onlineId: onlineId,
        accountId: profileData.account_id || null,
        aboutMe: profileData.about_me || null,
        languages: profileData.languages || [],
        isPlus: profileData.is_plus || false,
        isOfficiallyVerified: profileData.is_officially_verified || false,
        friendsCount: profileData.friends_count || 0,
        mutualFriendsCount: profileData.mutual_friends_count || 0,
        friendRelation: profileData.friend_relation || null,
        isBlocking: profileData.is_blocking || false,
        onlineStatus: profileData.online_status || null,
        lastProfileSync: new Date()
      }
    });
    
    // Save avatars
    if (profileData.avatars && profileData.avatars.length > 0) {
      // Delete existing avatars first to avoid duplicates
      await prisma.pSNAvatar.deleteMany({
        where: {
          profile: {
            userId: userId
          }
        }
      });
      
      // Create new avatar records
      for (const avatar of profileData.avatars) {
        await prisma.pSNAvatar.create({
          data: {
            profileId: userId,
            size: avatar.size,
            url: avatar.url
          }
        });
      }
      
      // Update user's avatar with the largest PSN avatar
      const largestAvatar = profileData.avatars.find((a: any) => a.size === 'xl') || 
                           profileData.avatars.find((a: any) => a.size === 'l') ||
                           profileData.avatars[0];
      
      if (largestAvatar) {
        await prisma.user.update({
          where: { id: userId },
          data: { avatarUrl: largestAvatar.url }
        });
      }
    }
    
    // Save trophy data if available
    if (profileData.trophy_level || (profileData.earned_trophies && Object.keys(profileData.earned_trophies).length > 0)) {
      await prisma.pSNTrophy.upsert({
        where: {
          profileId: userId
        },
        create: {
          profileId: userId,
          trophyLevel: profileData.trophy_level || null,
          progress: profileData.trophy_progress || null,
          tier: profileData.trophy_tier || null,
          platinumCount: profileData.earned_trophies?.platinum || 0,
          goldCount: profileData.earned_trophies?.gold || 0,
          silverCount: profileData.earned_trophies?.silver || 0,
          bronzeCount: profileData.earned_trophies?.bronze || 0,
          totalTrophies: (profileData.earned_trophies?.platinum || 0) + 
                        (profileData.earned_trophies?.gold || 0) + 
                        (profileData.earned_trophies?.silver || 0) + 
                        (profileData.earned_trophies?.bronze || 0)
        },
        update: {
          trophyLevel: profileData.trophy_level || null,
          progress: profileData.trophy_progress || null,
          tier: profileData.trophy_tier || null,
          platinumCount: profileData.earned_trophies?.platinum || 0,
          goldCount: profileData.earned_trophies?.gold || 0,
          silverCount: profileData.earned_trophies?.silver || 0,
          bronzeCount: profileData.earned_trophies?.bronze || 0,
          totalTrophies: (profileData.earned_trophies?.platinum || 0) + 
                        (profileData.earned_trophies?.gold || 0) + 
                        (profileData.earned_trophies?.silver || 0) + 
                        (profileData.earned_trophies?.bronze || 0)
        }
      });
    }
    
    // Fetch games data
    const gamesResponse = await fetch(`${psnApiUrl}/users/${onlineId}/games`);
    if (!gamesResponse.ok) {
      console.error('Failed to fetch PSN games data:', gamesResponse.statusText);
      return;
    }
    
    const gamesData = await gamesResponse.json();
    console.log(`Fetched ${gamesData.total_games} games for ${onlineId}`);
    
    // Save games data
    if (gamesData.games && gamesData.games.length > 0) {
      const profile = await prisma.pSNProfile.findUnique({
        where: { userId: userId }
      });
      
      if (!profile) {
        console.error('PSN Profile not found for user when saving games');
        return;
      }
      
      // Update lastGameSync timestamp
      await prisma.pSNProfile.update({
        where: { userId: userId },
        data: { lastGameSync: new Date() }
      });
      
      for (const game of gamesData.games) {
        // Convert play_duration string to minutes (e.g., "2 days, 3:45:22" -> minutes)
        let playTimeMinutes = 0;
        if (game.play_duration) {
          const durationParts = game.play_duration.split(', ');
          let days = 0;
          let timeStr = durationParts[0];
          
          if (durationParts.length > 1) {
            // Has days
            days = parseInt(durationParts[0].split(' ')[0]) || 0;
            timeStr = durationParts[1];
          }
          
          const timeParts = timeStr.split(':');
          const hours = parseInt(timeParts[0]) || 0;
          const minutes = parseInt(timeParts[1]) || 0;
          const seconds = parseInt(timeParts[2]) || 0;
          
          playTimeMinutes = (days * 24 * 60) + (hours * 60) + minutes + Math.floor(seconds / 60);
        }
        
        // Upsert game data
        await prisma.pSNGame.upsert({
          where: {
            profileId_titleId_platform: {
              profileId: profile.id,
              titleId: game.title_id,
              platform: game.platform
            }
          },
          create: {
            profileId: profile.id,
            name: game.name,
            titleId: game.title_id,
            platform: game.platform,
            imageUrl: game.image_url,
            playCount: game.play_count || 0,
            firstPlayed: game.first_played ? new Date(game.first_played) : null,
            lastPlayed: game.last_played ? new Date(game.last_played) : null,
            playDuration: game.play_duration || null,
            playTimeMinutes: playTimeMinutes,
            isCurrentlyPlaying: false
          },
          update: {
            name: game.name,
            imageUrl: game.image_url,
            playCount: game.play_count || 0,
            firstPlayed: game.first_played ? new Date(game.first_played) : null,
            lastPlayed: game.last_played ? new Date(game.last_played) : null,
            playDuration: game.play_duration || null,
            playTimeMinutes: playTimeMinutes
          }
        });
      }
    }
    
    console.log('Successfully saved PSN profile data for user:', userId);
  } catch (error) {
    console.error('Error saving PSN profile data:', error);
  }
} 