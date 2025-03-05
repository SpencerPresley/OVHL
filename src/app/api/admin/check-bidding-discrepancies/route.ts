import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';
import { biddingUtils } from '@/lib/redis';
import redis from '@/lib/redis';

const prisma = new PrismaClient();

/**
 * GET /api/admin/check-bidding-discrepancies
 * 
 * Admin endpoint to check for discrepancies between Redis and database
 * for players in bidding. Can help diagnose issues with players stuck
 * in "Ending..." state.
 */
export async function GET(request: NextRequest) {
  // Only allow admins to access this endpoint
  const session = await getServerSession(AuthOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get all Redis bidding keys
    const allKeys = await redis.keys('ovhl:bidding:*');
    console.log(`Found ${allKeys.length} keys in Redis`);

    // 2. Get all players marked as in bidding in the database
    const playersInBiddingDB = await prisma.playerSeason.findMany({
      where: { isInBidding: true },
      include: {
        player: true,
        teamSeasons: {
          include: {
            teamSeason: {
              include: {
                team: true,
                tier: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Found ${playersInBiddingDB.length} players marked as in bidding in the database`);

    // 3. Parse Redis data
    const redisPlayers = [];
    for (const key of allKeys) {
      const playerSeasonId = key.replace('ovhl:bidding:', '');
      const data = await redis.get(key);
      if (data) {
        try {
          const playerData = JSON.parse(data);
          redisPlayers.push({
            id: playerSeasonId,
            name: playerData.playerName,
            position: playerData.position,
            status: playerData.status,
            endTime: playerData.endTime ? new Date(playerData.endTime).toISOString() : null,
            currentBid: playerData.currentBid,
            currentTeam: playerData.currentTeamName
          });
        } catch (err) {
          console.error(`Error parsing data for key ${key}:`, err);
        }
      }
    }

    // 4. Find discrepancies
    
    // 4.1 Players in database but not in Redis
    const dbOnlyPlayers = playersInBiddingDB.filter(dbPlayer => 
      !redisPlayers.some(redisPlayer => redisPlayer.id === dbPlayer.id)
    ).map(p => ({
      id: p.id,
      name: p.player.name,
      position: p.position,
      hasTeam: p.teamSeasons.length > 0,
      teamName: p.teamSeasons[0]?.teamSeason.team.name || null
    }));
    
    // 4.2 Players in Redis but not marked as in bidding in DB
    const redisIds = redisPlayers.map(p => p.id);
    const notInBiddingDB = await prisma.playerSeason.findMany({
      where: { 
        id: { in: redisIds },
        isInBidding: false 
      },
      include: {
        player: true
      }
    });
    
    const redisOnlyPlayers = notInBiddingDB.map(p => {
      const redisData = redisPlayers.find(rp => rp.id === p.id);
      return {
        id: p.id,
        name: p.player.name,
        position: p.position,
        redisStatus: redisData?.status,
        redisEndTime: redisData?.endTime
      };
    });
    
    // 4.3 Players with "active" status in Redis that have expired timers
    const now = Date.now();
    const expiredInRedis = redisPlayers.filter(p => 
      p.status === 'active' && 
      p.endTime && 
      new Date(p.endTime).getTime() < now
    );

    // 4.4 Players on teams that are still in bidding
    const playersOnTeams = playersInBiddingDB.filter(p => p.teamSeasons.length > 0);
    const onTeamsButInBidding = playersOnTeams.map(p => ({
      id: p.id,
      name: p.player.name,
      position: p.position,
      teamName: p.teamSeasons[0]?.teamSeason.team.name || 'Unknown',
      tier: p.teamSeasons[0]?.teamSeason.tier.name || 'Unknown'
    }));

    return NextResponse.json({
      summary: {
        totalRedisKeys: allKeys.length,
        playersInBiddingDB: playersInBiddingDB.length,
        inDBButNotRedis: dbOnlyPlayers.length,
        inRedisButNotDB: redisOnlyPlayers.length,
        expiredInRedis: expiredInRedis.length,
        onTeamsButInBidding: onTeamsButInBidding.length
      },
      details: {
        dbOnlyPlayers,
        redisOnlyPlayers,
        expiredInRedis,
        onTeamsButInBidding
      }
    });
  } catch (error) {
    console.error('Error checking bidding discrepancies:', error);
    return NextResponse.json({ error: 'Failed to check bidding discrepancies' }, { status: 500 });
  }
} 