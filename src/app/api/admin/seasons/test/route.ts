import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Delete all existing data first
    await prisma.$transaction([
      prisma.playerMatch.deleteMany(),
      prisma.match.deleteMany(),
      prisma.playerTeamSeason.deleteMany(),
      prisma.teamSeason.deleteMany(),
      prisma.team.deleteMany(),
      prisma.playerTierHistory.deleteMany(),
      prisma.playerSeason.deleteMany(),
      prisma.tier.deleteMany(),
      prisma.season.deleteMany(),
    ]);

    // Create a new season
    const season = await prisma.season.create({
      data: {
        seasonId: '2024',
        isLatest: true,
      },
    });

    // Create tiers with their respective teams
    const tiers = [
      { name: 'NHL', level: 1 },
      { name: 'AHL', level: 2 },
      { name: 'ECHL', level: 3 },
      { name: 'CHL', level: 4 },
    ];

    for (const tierData of tiers) {
      const tier = await prisma.tier.create({
        data: {
          seasonId: season.id,
          name: tierData.name,
          leagueLevel: tierData.level,
        },
      });

      // Create teams for this tier
      const teams = [
        { name: `${tierData.name} Team 1`, identifier: 'TEAM1' },
        { name: `${tierData.name} Team 2`, identifier: 'TEAM2' },
      ];

      for (const teamData of teams) {
        const team = await prisma.team.create({
          data: {
            eaClubId: `${teamData.identifier}_CLUB`,
            eaClubName: teamData.name,
            officialName: teamData.name,
            teamIdentifier: teamData.identifier,
          },
        });

        await prisma.teamSeason.create({
          data: {
            teamId: team.id,
            tierId: tier.id,
            wins: 0,
            losses: 0,
            otLosses: 0,
            goalsAgainst: 0,
            goalsFor: 0,
            matchesPlayed: 0,
            penaltyKillGoalsAgainst: 0,
            penaltyKillOpportunities: 0,
            powerplayGoals: 0,
            powerplayOpportunities: 0,
            shots: 0,
            shotsAgainst: 0,
            timeOnAttack: 0,
          },
        });
      }
    }

    return NextResponse.json({
      message: 'Test data created successfully',
      season,
    });
  } catch (error) {
    console.error('Failed to create test data:', error);
    return NextResponse.json({ error: 'Failed to create test data' }, { status: 500 });
  }
}
