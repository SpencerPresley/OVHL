import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';
import { NHLDivision, AHLDivision, ECHLDivision } from '@/lib/teams/types';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

const LEAGUE_LEVELS: Record<string, number> = {
  nhl: 1,
  ahl: 2,
  echl: 3,
  chl: 4,
};

// Helper function to get division for a team
function getTeamDivision(teamIdentifier: string, leagueId: string) {
  const teamId = teamIdentifier.toLowerCase();
  console.log('Looking up division for:', { teamId, leagueId });

  switch (leagueId) {
    case 'nhl': {
      const team = NHL_TEAMS.find((t) => t.id === teamId);
      console.log('Found NHL team:', { team, validDivisions: Object.values(NHLDivision) });
      // Verify it's an NHL division
      if (team?.division && Object.values(NHLDivision).includes(team.division)) {
        return team.division;
      }
      return null;
    }
    case 'ahl': {
      const team = AHL_TEAMS.find((t) => t.id === teamId);
      console.log('Found AHL team:', { team, validDivisions: Object.values(AHLDivision) });
      // Verify it's an AHL division
      if (team?.division && Object.values(AHLDivision).includes(team.division)) {
        return team.division;
      }
      return null;
    }
    case 'echl': {
      const team = ECHL_TEAMS.find((t) => t.id === teamId);
      console.log('Found ECHL team:', { team, validDivisions: Object.values(ECHLDivision) });
      // Verify it's an ECHL division
      if (team?.division && Object.values(ECHLDivision).includes(team.division)) {
        return team.division;
      }
      return null;
    }
    case 'chl': {
      const team = CHL_TEAMS.find((t) => t.id === teamId);
      console.log('Found CHL team:', { team });
      // For CHL we also check the league property
      if (team?.division && team.league) {
        return team.division;
      }
      return null;
    }
    default:
      return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const leagueId = resolvedParams.id.toLowerCase();
    const leagueLevel = LEAGUE_LEVELS[leagueId];

    if (!leagueLevel) {
      return NextResponse.json({ error: 'Invalid league ID' }, { status: 400 });
    }

    // Get the latest season
    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!latestSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get the tier for this league
    const tier = await prisma.tier.findFirst({
      where: {
        seasonId: latestSeason.id,
        name: leagueId.toUpperCase(),
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'League tier not found' }, { status: 404 });
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

    console.log('Found team seasons:', teamSeasons.map(ts => ({
      teamId: ts.teamId,
      identifier: ts.team.teamIdentifier,
      name: ts.team.officialName
    })));

    // Calculate stats and group teams by division
    const teamsByDivision = new Map<string, any[]>();

    teamSeasons.forEach((ts) => {
      const division = getTeamDivision(ts.team.teamIdentifier, leagueId);
      if (!division) return;

      // Get the correct team data from the league-specific data
      let teamData;
      switch (leagueId) {
        case 'nhl':
          teamData = NHL_TEAMS.find((t) => t.id === ts.team.teamIdentifier.toLowerCase());
          break;
        case 'ahl':
          teamData = AHL_TEAMS.find((t) => t.id === ts.team.teamIdentifier.toLowerCase());
          break;
        case 'echl':
          teamData = ECHL_TEAMS.find((t) => t.id === ts.team.teamIdentifier.toLowerCase());
          break;
        case 'chl':
          teamData = CHL_TEAMS.find((t) => t.id === ts.team.teamIdentifier.toLowerCase());
          break;
      }

      if (!teamData) return;

      const teamStats = {
        teamId: ts.teamId,
        teamName: teamData.name,  // Use the name from league data instead of database
        teamIdentifier: ts.team.teamIdentifier,
        gamesPlayed: ts.matchesPlayed,
        wins: ts.wins,
        losses: ts.losses,
        otLosses: ts.otLosses,
        points: ts.wins * 2 + ts.otLosses,
        goalsFor: ts.goalsFor,
        goalsAgainst: ts.goalsAgainst,
        goalDifferential: ts.goalsFor - ts.goalsAgainst,
        powerplayGoals: ts.powerplayGoals,
        powerplayOpportunities: ts.powerplayOpportunities,
        powerplayPercentage:
          ts.powerplayOpportunities > 0 ? (ts.powerplayGoals / ts.powerplayOpportunities) * 100 : 0,
        penaltyKillGoalsAgainst: ts.penaltyKillGoalsAgainst,
        penaltyKillOpportunities: ts.penaltyKillOpportunities,
        penaltyKillPercentage:
          ts.penaltyKillOpportunities > 0
            ? ((ts.penaltyKillOpportunities - ts.penaltyKillGoalsAgainst) /
                ts.penaltyKillOpportunities) *
              100
            : 0,
      };

      if (!teamsByDivision.has(division)) {
        teamsByDivision.set(division, []);
      }
      teamsByDivision.get(division)?.push(teamStats);
    });

    // Sort teams within each division by points
    for (const [division, teams] of teamsByDivision) {
      teams.sort((a, b) => {
        // Sort by points first
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        // If points are tied, sort by team name
        return a.teamName.localeCompare(b.teamName);
      });
    }

    // Convert Map to array of divisions
    const standings = Array.from(teamsByDivision.entries()).map(([division, teams]) => ({
      division,
      teams,
    }));

    return NextResponse.json({
      standings,
    });
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}
