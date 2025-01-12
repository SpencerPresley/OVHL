import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

function generateRandomStats() {
  const gamesPlayed = Math.floor(Math.random() * 20) + 10; // 10-30 games
  const wins = Math.floor(Math.random() * gamesPlayed);
  const otLosses = Math.floor(Math.random() * (gamesPlayed - wins) / 2);
  const losses = gamesPlayed - wins - otLosses;
  
  const goalsFor = wins * 3 + losses + otLosses + Math.floor(Math.random() * 20);
  const goalsAgainst = losses * 3 + wins + otLosses + Math.floor(Math.random() * 20);
  
  const powerplayOpportunities = Math.floor(Math.random() * 50) + 30; // 30-80 opportunities
  const powerplayGoals = Math.floor(powerplayOpportunities * (Math.random() * 0.3)); // 0-30% success rate
  
  const penaltyKillOpportunities = Math.floor(Math.random() * 50) + 30;
  const penaltyKillGoalsAgainst = Math.floor(penaltyKillOpportunities * (Math.random() * 0.3));

  return {
    wins,
    losses,
    otLosses,
    goalsFor,
    goalsAgainst,
    matchesPlayed: gamesPlayed,
    powerplayGoals,
    powerplayOpportunities,
    penaltyKillGoalsAgainst,
    penaltyKillOpportunities,
    shots: goalsFor * 10 + Math.floor(Math.random() * 50),
    shotsAgainst: goalsAgainst * 10 + Math.floor(Math.random() * 50),
    timeOnAttack: gamesPlayed * 300 + Math.floor(Math.random() * 1000),
  };
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
                team: true
              }
            }
          }
        }
      }
    });

    if (!season) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 404 }
      );
    }

    // Update each team's stats with random data
    for (const tier of season.tiers) {
      for (const teamSeason of tier.teams) {
        const stats = generateRandomStats();
        await prisma.teamSeason.update({
          where: { id: teamSeason.id },
          data: stats
        });
      }
    }

    return NextResponse.json({ message: "Test data inserted successfully" });
  } catch (error) {
    console.error("Failed to insert test data:", error);
    return NextResponse.json(
      { error: "Failed to insert test data" },
      { status: 500 }
    );
  }
} 