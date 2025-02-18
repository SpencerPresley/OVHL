import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { System } from '@prisma/client';
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
      include: {
        tiers: {
          include: {
            teams: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // For each team, create 17 players (9F, 6D, 2G)
    for (const tier of season.tiers) {
      for (const teamSeason of tier.teams) {
        // Create roster structure
        const roster = {
          forwards: 9,
          defense: 6,
          goalies: 2,
        };

        // Create players for each position
        for (const [position, count] of Object.entries(roster)) {
          for (let i = 0; i < count; i++) {
            const gamertag = generateGamertag();
            const timestamp = Date.now();
            const randomNum = Math.floor(Math.random() * 10000);
            const system = Math.random() > 0.5 ? System.PS : System.XBOX;
            const pos =
              position === 'forwards'
                ? ['C', 'LW', 'RW'][Math.floor(Math.random() * 3)]
                : position === 'defense'
                  ? ['LD', 'RD'][Math.floor(Math.random() * 2)]
                  : 'G';

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

            // Generate random stats that will be used for both total and team stats
            const stats = {
              gamesPlayed: Math.floor(Math.random() * 20) + 10,
              goals: Math.floor(Math.random() * 15),
              assists: Math.floor(Math.random() * 20),
              plusMinus: Math.floor(Math.random() * 20) - 10,
              shots: Math.floor(Math.random() * 50) + 20,
              hits: Math.floor(Math.random() * 30),
              takeaways: Math.floor(Math.random() * 20),
              giveaways: Math.floor(Math.random() * 20),
              penaltyMinutes: Math.floor(Math.random() * 30),
              ...(pos === 'G'
                ? {
                    saves: Math.floor(Math.random() * 200) + 100,
                    goalsAgainst: Math.floor(Math.random() * 50) + 20,
                  }
                : {}),
            };

            // Create a player season with stats
            const playerSeason = await prisma.playerSeason.create({
              data: {
                player: { connect: { id: player.id } },
                season: { connect: { id: season.id } },
                position: pos,
                ...stats,
                contract: {
                  create: {
                    amount: Math.floor(Math.random() * 1500000) + 500000
                  }
                }
              },
            });

            // Create player team season
            const playerTeamSeason = await prisma.playerTeamSeason.create({
              data: {
                playerSeasonId: playerSeason.id,
                teamSeasonId: teamSeason.id,
                ...stats,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ message: 'Test players created successfully' });
  } catch (error) {
    console.error('Failed to create test players:', error);
    return NextResponse.json({ error: 'Failed to create test players' }, { status: 500 });
  }
}
