import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NHL_TEAMS } from "@/lib/teams/nhl";
import { AHL_TEAMS } from "@/lib/teams/ahl";
import { ECHL_TEAMS } from "@/lib/teams/echl";
import { CHL_TEAMS } from "@/lib/teams/chl";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// League tiers configuration with their teams
const LEAGUE_TIERS = [
  { name: "NHL", level: 1, teams: NHL_TEAMS },
  { name: "AHL", level: 2, teams: AHL_TEAMS },
  { name: "ECHL", level: 3, teams: ECHL_TEAMS },
  { name: "CHL", level: 4, teams: CHL_TEAMS },
] as const;

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
      isAdmin?: boolean;
    };

    // Verify admin status
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { seasonId } = body;

    if (!seasonId) {
      return NextResponse.json(
        { error: "Season ID is required" },
        { status: 400 },
      );
    }

    // Set all other seasons to not latest
    await prisma.season.updateMany({
      where: { isLatest: true },
      data: { isLatest: false },
    });

    // Create the new season
    const season = await prisma.season.create({
      data: {
        seasonId,
        isLatest: true,
      },
    });

    // Create tiers and link existing teams
    for (const tierData of LEAGUE_TIERS) {
      const tier = await prisma.tier.create({
        data: {
          seasonId: season.id,
          name: tierData.name,
          leagueLevel: tierData.level,
        },
      });

      // Get all teams for this league level
      const teams = await prisma.team.findMany({
        where: {
          teamIdentifier: {
            in: tierData.teams.map(t => t.id.toUpperCase()),
          },
        },
      });

      // Create team seasons for each team
      for (const team of teams) {
        await prisma.teamSeason.create({
          data: {
            teamId: team.id,
            tierId: tier.id,
          },
        });
      }
    }

    return NextResponse.json({
      message: "Season created successfully",
      season,
    });
  } catch (error) {
    console.error("Failed to create season:", error);
    return NextResponse.json(
      { error: "Failed to create season" },
      { status: 500 },
    );
  }
} 