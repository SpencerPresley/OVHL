import { NextResponse } from 'next/server';
import { System, PlayerPosition, PositionGroup, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper function to generate random gamertag/name
function generateName(): string {
  const prefixes = ['Pro', 'Elite', 'Top', 'Best', 'Epic', 'Super', 'Ultra', 'Mega', 'Ace', 'Star'];
  const nouns = ['Player', 'Sniper', 'Dangler', 'Grinder', 'Scout', 'Rookie', 'Champ', 'Titan', 'Hero', 'Legend'];
  const numbers = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, '0');

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  // Ensure more uniqueness for username/email generation later
  return `${prefix}${noun}${numbers}_${Date.now().toString().slice(-4)}`;
}

// Helper function to get a random Forward position
function getRandomForwardPosition(): PlayerPosition {
    const forwardPositions: PlayerPosition[] = [PlayerPosition.C, PlayerPosition.LW, PlayerPosition.RW];
    return forwardPositions[Math.floor(Math.random() * forwardPositions.length)];
}

// Helper function to get a random Defense position
function getRandomDefensePosition(): PlayerPosition {
    const defensePositions: PlayerPosition[] = [PlayerPosition.LD, PlayerPosition.RD];
    return defensePositions[Math.floor(Math.random() * defensePositions.length)];
}

export async function POST() {
  try {
    // Get the latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
      select: { id: true }, // Only need the ID
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    const createdUsersInfo = [];
    // Define target counts based on calculation (adjust if needed)
    const targetCounts = {
      [PositionGroup.FORWARD]: 1535,
      [PositionGroup.DEFENSE]: 1024,
      [PositionGroup.GOALIE]: 341,
    };
    const totalPlayersToCreate = Object.values(targetCounts).reduce((sum, count) => sum + count, 0);
    let createdCount = 0;

    console.log(`Attempting to create ${totalPlayersToCreate} players...`);

    // Create players for each position group to ensure distribution
    for (const [group, count] of Object.entries(targetCounts)) {
      const positionGroup = group as PositionGroup;
      console.log(`Creating ${count} ${positionGroup}s...`);

      for (let i = 0; i < count; i++) {
        const name = generateName();
        const system = Math.random() > 0.5 ? System.PS : System.XBOX;
        console.log(`[Debug] Assigned system: ${system}`);
        const uniqueSuffix = `${name.toLowerCase()}_${createdCount++}`;
        const email = `${uniqueSuffix}@test.com`;
        const username = uniqueSuffix;
        
        let primaryPosition: PlayerPosition;
        if (positionGroup === PositionGroup.FORWARD) {
          primaryPosition = getRandomForwardPosition();
        } else if (positionGroup === PositionGroup.DEFENSE) {
          primaryPosition = getRandomDefensePosition();
        } else { // GOALIE
          primaryPosition = PlayerPosition.G;
        }

        try {
            // Wrap creations for a single player/user in a transaction for safety
            const userInfo = await prisma.$transaction(async (tx) => {
            // 1. Create user with more fields initialized
            const user = await tx.user.create({
                data: {
                email: email,
                username: username,
                password: await bcrypt.hash('password123', 10),
                name: name,
                role: UserRole.USER,
                activeSystem: system,
                isSuperAdmin: false,
                isAdmin: false,
                isCommissioner: false,
                isBog: false,
                isTeamManager: false,
                },
            });

            // 2. Create System History entry
            console.log(`[Debug] Using system for History: ${system}, User ID: ${user.id}`);
            await tx.systemHistory.create({
                data: {
                    userId: user.id,
                    system: system,
                }
            });

            // 3. Create Gamertag History entry (initial)
            await tx.gamertagHistory.create({
                data: {
                    userId: user.id,
                    system: system,
                    gamertag: name, 
                    isVerified: true, 
                    verifiedAt: new Date(),
                    verificationStatus: 'VERIFIED'
                }
            });

            // 4. Create contract first
            const contract = await tx.contract.create({
                data: {
                amount: 500000, 
                },
            });

            // 5. Create player season, linking user, season, and contract
            const playerSeason = await tx.playerSeason.create({
                data: {
                userId: user.id,
                seasonId: season.id,
                contractId: contract.id,
                primaryPosition: primaryPosition,
                positionGroup: positionGroup,
                },
            });

            return {
                userId: user.id,
                name: user.name,
                position: playerSeason.primaryPosition,
                playerSeasonId: playerSeason.id,
            };
            });
            
            createdUsersInfo.push(userInfo);
        } catch(innerError) {
            // Log error for the specific player creation attempt but continue loop
             console.error(`Failed to create player ${i + 1} for group ${positionGroup} (Name: ${name}):`, innerError);
             // Handle potential unique constraint errors specifically if needed
             if (innerError instanceof Error && (innerError as any).code === 'P2002') {
                 console.warn(`Skipping player due to duplicate data (email/username likely): ${username}`);
             } else {
                // Optionally re-throw if you want the whole process to fail on any single error
                // throw innerError;
             }
        }
      }
      console.log(`Finished creating ${positionGroup}s.`);
    }

    console.log(`Successfully created ${createdUsersInfo.length} out of ${totalPlayersToCreate} attempted players.`);

    return NextResponse.json({
      message: `User, History, and PlayerSeason records created successfully for the latest season. Created ${createdUsersInfo.length} players.`, // Updated message
      playersCreated: createdUsersInfo.length,
      // players: createdUsersInfo // Optionally return the list of created players
    });
  } catch (error) {
    // This outer catch handles errors like DB connection issues or issues before the loop
    console.error('Failed to complete player creation process:', error);
    return NextResponse.json({ error: 'Failed to create players' }, { status: 500 });
  }
}
