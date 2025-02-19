import { NextResponse } from 'next/server';
import { PrismaClient, System } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// Helper function to generate random gamertag
function generateGamertag(): string {
  const prefixes = ['Pro', 'Elite', 'Top', 'Best', 'Epic', 'Super', 'Ultra', 'Mega'];
  const nouns = ['Player', 'Sniper', 'Dangler', 'Grinder', 'Snipe', 'Celly', 'Sauce', 'Deke'];
  const numbers = Math.floor(Math.random() * 99)
    .toString()
    .padStart(2, '0');

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${prefix}${noun}${numbers}`;
}

export async function POST() {
  try {
    // Get the latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    const createdPlayers = [];
    // Calculate minimum needed players plus extra
    const totalPlayers = (32 * 17) + // NHL teams
                        (32 * 17) + // AHL teams
                        (28 * 17) + // ECHL teams
                        (60 * 17) + // CHL teams
                        200;        // Extra players for free agency

    // Create players without team assignments
    for (let i = 0; i < totalPlayers; i++) {
      const gamertag = generateGamertag();
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 10000);
      const system = Math.random() > 0.5 ? System.PS : System.XBOX;
      
      // Determine position (maintaining same ratio as before)
      let pos;
      if (i % 17 < 9) { // First 9 of every 17 are forwards
        pos = ['C', 'LW', 'RW'][Math.floor(Math.random() * 3)];
      } else if (i % 17 < 15) { // Next 6 are defense
        pos = ['LD', 'RD'][Math.floor(Math.random() * 2)];
      } else { // Last 2 are goalies
        pos = 'G';
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: `${gamertag.toLowerCase()}_${timestamp}_${randomNum}@test.com`,
          username: `${gamertag.toLowerCase()}_${timestamp}_${randomNum}`,
          password: await bcrypt.hash('password123', 10),
          name: gamertag,
        },
      });

      // Create player
      const player = await prisma.player.create({
        data: {
          id: user.id,
          ea_id: `EA_${gamertag}`,
          name: gamertag,
          activeSystem: system,
        },
      });

      // Create gamertag history
      await prisma.gamertagHistory.create({
        data: {
          playerId: player.id,
          system,
          gamertag,
        },
      });

      // Create contract first
      const contract = await prisma.contract.create({
        data: {
          amount: 500000
        }
      });

      // Create player season with contract reference
      const playerSeason = await prisma.playerSeason.create({
        data: {
          player: { connect: { id: player.id } },
          season: { connect: { id: season.id } },
          contract: { connect: { id: contract.id } },
          position: pos,
          gamesPlayed: 0,
          goals: 0,
          assists: 0,
          plusMinus: 0,
          shots: 0,
          hits: 0,
          takeaways: 0,
          giveaways: 0,
          penaltyMinutes: 0,
          ...(pos === 'G' ? { saves: 0, goalsAgainst: 0 } : {})
        },
      });

      createdPlayers.push({
        name: gamertag,
        position: pos,
      });
    }

    return NextResponse.json({ 
      message: 'Players created successfully for the current season', 
      playersCreated: createdPlayers.length,
      players: createdPlayers
    });
  } catch (error) {
    console.error('Failed to create players:', error);
    return NextResponse.json({ error: 'Failed to create players' }, { status: 500 });
  }
} 