import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NHL_TEAMS } from "@/lib/teams/nhl";
import { AHL_TEAMS } from "@/lib/teams/ahl";
import { ECHL_TEAMS } from "@/lib/teams/echl";
import { CHL_TEAMS } from "@/lib/teams/chl";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Step 1: Create NHL Teams
    const nhlTeams = await Promise.all(
      NHL_TEAMS.map(async (team) => {
        return await prisma.team.upsert({
          where: { teamIdentifier: team.id.toUpperCase() },
          create: {
            eaClubId: "",
            eaClubName: "",
            officialName: team.name,
            teamIdentifier: team.id.toUpperCase(),
          },
          update: {
            officialName: team.name,
          },
        });
      })
    );

    // Step 2: Create AHL Teams with NHL Affiliations
    const ahlTeams = await Promise.all(
      AHL_TEAMS.map(async (team) => {
        const nhlTeam = team.nhlTeamId ? 
          nhlTeams.find(t => t.teamIdentifier === team.nhlTeamId?.toUpperCase()) : 
          null;

        return await prisma.team.upsert({
          where: { teamIdentifier: team.id.toUpperCase() },
          create: {
            eaClubId: "",
            eaClubName: "",
            officialName: team.name,
            teamIdentifier: team.id.toUpperCase(),
            nhlAffiliateId: nhlTeam?.id,
          },
          update: {
            officialName: team.name,
            nhlAffiliateId: nhlTeam?.id,
          },
        });
      })
    );

    // Step 3: Create ECHL Teams with NHL and AHL Affiliations
    await Promise.all(
      ECHL_TEAMS.map(async (team) => {
        const nhlTeam = team.nhlTeamId ? 
          nhlTeams.find(t => t.teamIdentifier === team.nhlTeamId.toUpperCase()) : 
          null;
        
        const ahlTeam = team.ahlTeamId ? 
          ahlTeams.find(t => t.teamIdentifier === team.ahlTeamId.toUpperCase()) : 
          null;

        return await prisma.team.upsert({
          where: { teamIdentifier: team.id.toUpperCase() },
          create: {
            eaClubId: "",
            eaClubName: "",
            officialName: team.name,
            teamIdentifier: team.id.toUpperCase(),
            nhlAffiliateId: nhlTeam?.id,
            ahlAffiliateId: ahlTeam?.id,
          },
          update: {
            officialName: team.name,
            nhlAffiliateId: nhlTeam?.id,
            ahlAffiliateId: ahlTeam?.id,
          },
        });
      })
    );

    // Step 4: Create CHL Teams (no affiliations needed)
    await Promise.all(
      CHL_TEAMS.map(async (team) => {
        return await prisma.team.upsert({
          where: { teamIdentifier: team.id.toUpperCase() },
          create: {
            eaClubId: "",
            eaClubName: "",
            officialName: team.name,
            teamIdentifier: team.id.toUpperCase(),
          },
          update: {
            officialName: team.name,
          },
        });
      })
    );

    return NextResponse.json({
      message: "Teams setup completed successfully",
    });
  } catch (error) {
    console.error("Failed to setup teams:", error);
    return NextResponse.json(
      { error: "Failed to setup teams" },
      { status: 500 },
    );
  }
} 