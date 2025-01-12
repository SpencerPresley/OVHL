import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

const LEAGUE_LEVELS: Record<string, number> = {
  nhl: 1,
  ahl: 2,
  echl: 3,
  chl: 4,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const leagueId = resolvedParams.id.toLowerCase();
    const leagueLevel = LEAGUE_LEVELS[leagueId];

    if (!leagueLevel) {
      return NextResponse.json(
        { error: "Invalid league ID" },
        { status: 400 }
      );
    }

    // Get the latest season
    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!latestSeason) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 404 }
      );
    }

    // Get the tier for this league
    const tier = await prisma.tier.findFirst({
      where: {
        seasonId: latestSeason.id,
        leagueLevel,
      },
    });

    if (!tier) {
      return NextResponse.json(
        { error: "League tier not found" },
        { status: 404 }
      );
    }

    // Get all team seasons for this tier
    const teamSeasons = await prisma.teamSeason.findMany({
      where: {
        tierId: tier.id,
      },
      include: {
        team: true,
      },
    });

    // Calculate stats and sort teams
    const teams = teamSeasons.map(ts => ({
      teamId: ts.teamId,
      teamName: ts.team.officialName,
      teamIdentifier: ts.team.teamIdentifier,
      gamesPlayed: ts.matchesPlayed,
      wins: ts.wins,
      losses: ts.losses,
      otLosses: ts.otLosses,
      points: (ts.wins * 2) + ts.otLosses,
      goalsFor: ts.goalsFor,
      goalsAgainst: ts.goalsAgainst,
      goalDifferential: ts.goalsFor - ts.goalsAgainst,
      powerplayGoals: ts.powerplayGoals,
      powerplayOpportunities: ts.powerplayOpportunities,
      powerplayPercentage: ts.powerplayOpportunities > 0 
        ? (ts.powerplayGoals / ts.powerplayOpportunities) * 100 
        : 0,
      penaltyKillGoalsAgainst: ts.penaltyKillGoalsAgainst,
      penaltyKillOpportunities: ts.penaltyKillOpportunities,
      penaltyKillPercentage: ts.penaltyKillOpportunities > 0
        ? ((ts.penaltyKillOpportunities - ts.penaltyKillGoalsAgainst) / ts.penaltyKillOpportunities) * 100
        : 0,
    })).sort((a, b) => {
      // Sort by points first
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      // If points are tied, sort by team name
      return a.teamName.localeCompare(b.teamName);
    });

    return NextResponse.json({
      standings: [{
        tierName: tier.name,
        teams,
      }],
    });
  } catch (error) {
    console.error("Failed to fetch standings:", error);
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 500 },
    );
  }
} 