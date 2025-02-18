/**
 * @file stats/route.ts
 * @description API route for retrieving league statistics (players, goalies, teams)
 * 
 * Features:
 * - Retrieves stats for players, goalies, and teams within a specific league
 * - Handles league-specific team data and division mapping
 * - Supports filtering by category (players, goalies, teams)
 * - Calculates derived statistics (points, percentages, etc.)
 * 
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';

// Type definitions for league-specific team data
type NHLTeam = typeof NHL_TEAMS[number];
type AHLTeam = typeof AHL_TEAMS[number];
type ECHLTeam = typeof ECHL_TEAMS[number];
type CHLTeam = typeof CHL_TEAMS[number];

interface TeamInfo {
  id: string;
  division?: string;
  conference?: string;
  league?: string;
}

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET handler for league statistics
 * 
 * @param request - The incoming request object
 * @param params - Route parameters containing the league ID
 * @returns JSON response with league statistics
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'players';

    // Get the latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get the tier for this league using league name
    const tier = await prisma.tier.findFirst({
      where: {
        seasonId: season.id,
        name: id.toUpperCase(),
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    let stats;

    switch (category) {
      case 'players':
        stats = await getPlayerStats(tier.id);
        break;
      case 'goalies':
        stats = await getGoalieStats(tier.id);
        break;
      case 'teams':
        stats = await getTeamStats(tier.id, id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

/**
 * Retrieves player statistics for a specific tier
 * @param tierId - The ID of the tier to get stats for
 */
async function getPlayerStats(tierId: string) {
  const players = await prisma.playerTeamSeason.findMany({
    where: {
      teamSeason: {
        tierId: tierId,
      },
      playerSeason: {
        position: {
          not: 'G',
        },
      },
    },
    include: {
      playerSeason: {
        include: {
          player: {
            include: {
              gamertags: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
      teamSeason: {
        include: {
          team: true,
        },
      },
    },
  });

  return players.map(stat => ({
    id: stat.playerSeason.player.id,
    name: stat.playerSeason.player.name,
    gamertag: stat.playerSeason.player.gamertags[0]?.gamertag || stat.playerSeason.player.name,
    teamIdentifier: stat.teamSeason.team.teamIdentifier,
    position: stat.playerSeason.position,
    gamesPlayed: stat.gamesPlayed,
    goals: stat.goals,
    assists: stat.assists,
    points: stat.goals + stat.assists,
    plusMinus: stat.plusMinus,
    pim: stat.penaltyMinutes,
  }));
}

/**
 * Retrieves goalie statistics for a specific tier
 * @param tierId - The ID of the tier to get stats for
 */
async function getGoalieStats(tierId: string) {
  const goalies = await prisma.playerTeamSeason.findMany({
    where: {
      teamSeason: {
        tierId: tierId,
      },
      playerSeason: {
        position: 'G',
      },
    },
    include: {
      playerSeason: {
        include: {
          player: {
            include: {
              gamertags: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
      teamSeason: {
        include: {
          team: true,
        },
      },
    },
  });

  return goalies.map(stat => ({
    id: stat.playerSeason.player.id,
    name: stat.playerSeason.player.name,
    gamertag: stat.playerSeason.player.gamertags[0]?.gamertag || stat.playerSeason.player.name,
    teamIdentifier: stat.teamSeason.team.teamIdentifier,
    gamesPlayed: stat.gamesPlayed,
    goalsAgainst: stat.goalsAgainst || 0,
    saves: stat.saves || 0,
    gaa: (stat.goalsAgainst || 0) / (stat.gamesPlayed || 1),
    savePercentage: (stat.saves || 0) / ((stat.saves || 0) + (stat.goalsAgainst || 0) || 1),
    shutouts: 0, // TODO: Add shutouts tracking
  }));
}

/**
 * Retrieves team statistics for a specific tier
 * @param tierId - The ID of the tier to get stats for
 * @param leagueId - The ID of the league (nhl, ahl, etc.)
 */
async function getTeamStats(tierId: string, leagueId: string) {
  const teams = await prisma.teamSeason.findMany({
    where: {
      tierId: tierId,
    },
    include: {
      team: true,
    },
  });

  return teams.map(stat => {
    // Find the team in the appropriate league data
    const teamId = stat.team.teamIdentifier.toLowerCase();
    const teamInfo = leagueId === 'nhl' ? NHL_TEAMS.find(t => t.id === teamId) :
                    leagueId === 'ahl' ? AHL_TEAMS.find(t => t.id === teamId) :
                    leagueId === 'echl' ? ECHL_TEAMS.find(t => t.id === teamId) :
                    leagueId === 'chl' ? CHL_TEAMS.find(t => t.id === teamId) :
                    undefined;
    
    // Get league-specific metadata
    const extraInfo = leagueId === 'nhl' ? {
      division: (teamInfo as NHLTeam)?.division,
      conference: (teamInfo as NHLTeam)?.conference,
    } : leagueId === 'ahl' || leagueId === 'echl' ? {
      division: teamInfo?.division,
    } : leagueId === 'chl' ? {
      league: (teamInfo as CHLTeam)?.league,
    } : {};

    return {
      id: stat.team.id,
      name: teamInfo?.name || stat.team.officialName,
      teamIdentifier: stat.team.teamIdentifier,
      ...extraInfo,
      gamesPlayed: stat.matchesPlayed,
      wins: stat.wins,
      losses: stat.losses,
      otl: stat.otLosses,
      points: (stat.wins * 2) + stat.otLosses,
      goalsFor: stat.goalsFor,
      goalsAgainst: stat.goalsAgainst,
      powerplayPercentage: stat.powerplayOpportunities > 0 
        ? stat.powerplayGoals / stat.powerplayOpportunities 
        : 0,
      penaltyKillPercentage: stat.penaltyKillOpportunities > 0
        ? 1 - (stat.penaltyKillGoalsAgainst / stat.penaltyKillOpportunities)
        : 0,
    };
  });
} 
