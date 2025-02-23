/**
 * @file League Stats API Route
 * @description Handles fetching and formatting of league statistics for both player and team stats.
 * This endpoint consolidates business logic for stat processing that was previously handled client-side.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * Represents the different categories of statistics that can be queried
 */
export const StatCategory = z.enum([
  'Points',
  'Goals',
  'Assists',
  '+/-',
  'SV%',
  'GAA',
  'Wins',
  'PP%',
  'PK%'
]);

export type StatCategory = z.infer<typeof StatCategory>;

/**
 * Interface for a formatted stat entry, whether player or team
 */
interface FormattedStat {
  id: string;
  name: string;
  gamertag?: string;
  value: number;
  formattedValue: string;
  teamIdentifier: string;
  isTeamStat: boolean;
}

/**
 * Formats a numeric value based on the stat category
 * @param value - The raw numeric value
 * @param category - The category of the stat
 * @returns Formatted string representation of the value
 */
function formatStatValue(value: number, category: StatCategory): string {
  if (category === 'SV%' || category === 'PP%' || category === 'PK%') {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (category === 'GAA') {
    return value.toFixed(2);
  }
  if (category === '+/-' && value > 0) {
    return `+${value}`;
  }
  return value.toString();
}

/**
 * Determines if a stat category is team-based
 * @param category - The category to check
 * @returns boolean indicating if the stat is team-based
 */
function isTeamStat(category: StatCategory): boolean {
  return ['Wins', 'PP%', 'PK%'].includes(category);
}

/**
 * GET handler for league stats
 * Fetches and formats league statistics based on the requested category
 * 
 * @param request - The incoming request object
 * @returns Formatted stats for the requested category
 * 
 * @example
 * GET /api/stats/league?category=Points
 * Returns top players by points
 * 
 * @example
 * GET /api/stats/league?category=PP%
 * Returns teams by power play percentage
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const leagueId = searchParams.get('leagueId');

    // Validate parameters
    const parsedCategory = StatCategory.safeParse(category);
    if (!parsedCategory.success || !leagueId) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const statCategory = parsedCategory.data;
    const isTeamStatCategory = isTeamStat(statCategory);

    // Get the latest season
    const currentSeason = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!currentSeason) {
      return NextResponse.json(
        { error: 'No active season found' },
        { status: 404 }
      );
    }

    // Get the tier for this league
    const tier = await prisma.tier.findFirst({
      where: {
        seasonId: currentSeason.id,
        name: leagueId.toUpperCase(),
      },
    });

    if (!tier) {
      return NextResponse.json(
        { error: 'League tier not found' },
        { status: 404 }
      );
    }

    let stats: FormattedStat[] = [];

    if (isTeamStatCategory) {
      // Fetch team stats
      const teamSeasons = await prisma.teamSeason.findMany({
        where: { tier: { seasonId: currentSeason.id } },
        include: {
          team: true,
          tier: true,
        },
      });

      stats = teamSeasons.map(teamSeason => {
        let value = 0;
        switch (statCategory) {
          case 'Wins':
            value = teamSeason.wins;
            break;
          case 'PP%':
            value = teamSeason.powerplayGoals / teamSeason.powerplayOpportunities;
            break;
          case 'PK%':
            value = 1 - (teamSeason.penaltyKillGoalsAgainst / teamSeason.penaltyKillOpportunities);
            break;
        }

        return {
          id: teamSeason.team.id,
          name: teamSeason.team.officialName,
          value,
          formattedValue: formatStatValue(value, statCategory),
          teamIdentifier: teamSeason.team.teamIdentifier,
          isTeamStat: true
        };
      });
    } else {
      // Fetch player stats
      const playerSeasons = await prisma.playerSeason.findMany({
        where: { seasonId: currentSeason.id },
        include: {
          player: {
            include: {
              gamertags: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
          teamSeasons: {
            include: {
              teamSeason: {
                include: {
                  team: true,
                },
              },
            },
          },
        },
      });

      stats = playerSeasons.map(playerSeason => {
        let value = 0;
        switch (statCategory) {
          case 'Points':
            value = (playerSeason.goals || 0) + (playerSeason.assists || 0);
            break;
          case 'Goals':
            value = playerSeason.goals || 0;
            break;
          case 'Assists':
            value = playerSeason.assists || 0;
            break;
          case '+/-':
            value = playerSeason.plusMinus || 0;
            break;
          case 'SV%':
            value = playerSeason.saves ? playerSeason.saves / (playerSeason.saves + (playerSeason.goalsAgainst || 0)) : 0;
            break;
          case 'GAA':
            value = playerSeason.goalsAgainst && playerSeason.gamesPlayed 
              ? (playerSeason.goalsAgainst / playerSeason.gamesPlayed) 
              : 0;
            break;
        }

        const currentTeam = playerSeason.teamSeasons[0]?.teamSeason.team;

        return {
          id: playerSeason.player.id,
          name: playerSeason.player.name,
          gamertag: playerSeason.player.gamertags[0]?.gamertag || playerSeason.player.name,
          value,
          formattedValue: formatStatValue(value, statCategory),
          teamIdentifier: currentTeam?.teamIdentifier || 'FA',
          isTeamStat: false
        };
      });
    }

    // Sort stats in descending order (ascending for GAA)
    stats.sort((a, b) => 
      statCategory === 'GAA' ? a.value - b.value : b.value - a.value
    );

    // Take top 10
    stats = stats.slice(0, 10);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Failed to fetch league stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league stats' },
      { status: 500 }
    );
  }
} 