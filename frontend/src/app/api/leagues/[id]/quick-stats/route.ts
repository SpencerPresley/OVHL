/**
 * @file quick-stats/route.ts
 * @author Spencer Presley
 * @version 1.0.0
 * @license Proprietary - Copyright (c) 2025 Spencer Presley
 * @copyright All rights reserved. This code is the exclusive property of Spencer Presley.
 * @notice Unauthorized copying, modification, distribution, or use is strictly prohibited.
 *
 * @description Frontend-specific Quick Stats API Route for League Statistics Display
 * @module api/leagues/[id]/quick-stats
 *
 * @requires next/server
 * @requires @prisma/client
 * @requires zod
 *
 * League Quick Stats Processing and Formatting Endpoint
 * This endpoint is specifically designed for frontend presentation needs and is tightly
 * coupled with the LeagueQuickStats component. It handles UI-specific transformations
 * and formatting of league statistics.
 *
 * Features:
 * - Top 10 player/team stats formatting
 * - Category-specific value formatting
 * - UI-focused data transformation
 * - League-specific stat filtering
 * - Component-specific error handling
 *
 * Frontend Coupling:
 * This endpoint is intentionally kept in the frontend codebase due to its
 * UI-specific nature. Core statistics processing and business logic should
 * be moved to the dedicated backend service when implemented.
 *
 * Technical Implementation:
 * - Efficient database queries with proper joins
 * - Type-safe parameter validation using Zod
 * - Modular stat processing functions
 * - Clear separation from core business logic
 *
 * Performance Considerations:
 * - Minimal data transformation overhead
 * - Efficient query patterns
 * - Response size optimization (top 10 limit)
 *
 * @example
 * // Component usage
 * fetch('/api/leagues/nhl/quick-stats?category=Points')
 *   .then(res => res.json())
 *   .then(data => updateStatsDisplay(data.stats));
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * Represents the different categories of statistics that can be queried
 * Used for type-safe validation of category parameter
 */
export const StatCategory = z.enum([
  'POINTS',
  'GOALS',
  'ASSISTS',
  'PLUSMINUS',
  'SAVEPCT',
  'GAA',
  'WINS',
  'POWERPLAY',
  'PENALTYKILL',
]);

export type StatCategory = z.infer<typeof StatCategory>;

/**
 * Interface for a formatted stat entry
 * Represents the standardized format for both player and team statistics
 * that will be consumed by the frontend component
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
 * Handles specific formatting requirements for different stat types:
 * - Percentages (PP%, PK%, SV%)
 * - Goals Against Average (GAA)
 * - Plus/Minus (+/-)
 *
 * @param value - The raw numeric value to format
 * @param category - The category determining formatting rules
 * @returns Formatted string representation of the value
 */
function formatStatValue(value: number, category: StatCategory): string {
  if (category === 'SAVEPCT' || category === 'POWERPLAY' || category === 'PENALTYKILL') {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (category === 'GAA') {
    return value.toFixed(2);
  }
  if (category === 'PLUSMINUS' && value > 0) {
    return `+${value}`;
  }
  return value.toString();
}

/**
 * Determines if a stat category is team-based
 * Used to switch between team and player stat processing
 *
 * @param category - The category to check
 * @returns boolean indicating if the stat is team-based
 */
function isTeamStat(category: StatCategory): boolean {
  return ['WINS', 'POWERPLAY', 'PENALTYKILL'].includes(category);
}

/**
 * GET handler for league quick stats
 * Processes and formats league statistics for frontend display
 *
 * Features:
 * - League-specific stat filtering
 * - Category-based processing
 * - Top 10 limitation for display
 * - Formatted values for UI presentation
 *
 * Note: This endpoint is intentionally frontend-focused and handles
 * UI-specific transformations. Core stat calculations should be moved
 * to the backend service when implemented.
 *
 * @param request - The incoming request object
 * @param params - Route parameters including league ID
 * @returns Formatted stats for frontend display
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const resolvedParams = await params;
    const leagueId = resolvedParams.id;

    // Validate parameters
    const decodedCategory = category ? decodeURIComponent(category) : null;
    const parsedCategory = StatCategory.safeParse(decodedCategory);
    if (!parsedCategory.success || !leagueId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const statCategory = parsedCategory.data;
    const isTeamStatCategory = isTeamStat(statCategory);

    // Get the latest season
    const currentSeason = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!currentSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get the tier for this league
    const tier = await prisma.tier.findFirst({
      where: {
        seasonId: currentSeason.id,
        name: leagueId.toUpperCase(),
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'League tier not found' }, { status: 404 });
    }

    let stats: FormattedStat[] = [];

    if (isTeamStatCategory) {
      // Fetch team stats
      const teamSeasons = await prisma.teamSeason.findMany({
        where: { tierId: tier.id },
        include: {
          team: true,
          tier: true,
        },
      });

      stats = teamSeasons.map((teamSeason) => {
        let value = 0;
        switch (statCategory) {
          case 'WINS':
            value = teamSeason.wins;
            break;
          case 'POWERPLAY':
            value = teamSeason.powerplayGoals / teamSeason.powerplayOpportunities;
            break;
          case 'PENALTYKILL':
            value = 1 - teamSeason.penaltyKillGoalsAgainst / teamSeason.penaltyKillOpportunities;
            break;
        }

        return {
          id: teamSeason.team.id,
          name: teamSeason.team.officialName,
          value,
          formattedValue: formatStatValue(value, statCategory),
          teamIdentifier: teamSeason.team.teamIdentifier,
          isTeamStat: true,
        };
      });
    } else {
      // Fetch player stats
      const playerSeasons = await prisma.playerSeason.findMany({
        where: {
          seasonId: currentSeason.id,
          teamSeasons: {
            some: {
              teamSeason: {
                tierId: tier.id,
              },
            },
          },
        },
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

      stats = playerSeasons.map((playerSeason) => {
        let value = 0;
        switch (statCategory) {
          case 'POINTS':
            value = (playerSeason.goals || 0) + (playerSeason.assists || 0);
            break;
          case 'GOALS':
            value = playerSeason.goals || 0;
            break;
          case 'ASSISTS':
            value = playerSeason.assists || 0;
            break;
          case 'PLUSMINUS':
            value = playerSeason.plusMinus || 0;
            break;
          case 'SAVEPCT':
            value = playerSeason.saves
              ? playerSeason.saves / (playerSeason.saves + (playerSeason.goalsAgainst || 0))
              : 0;
            break;
          case 'GAA':
            value =
              playerSeason.goalsAgainst && playerSeason.gamesPlayed
                ? playerSeason.goalsAgainst / playerSeason.gamesPlayed
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
          isTeamStat: false,
        };
      });
    }

    // Sort stats in descending order (ascending for GAA)
    stats.sort((a, b) => (statCategory === 'GAA' ? a.value - b.value : b.value - a.value));

    // Take top 10
    stats = stats.slice(0, 10);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Failed to fetch league stats:', error);
    return NextResponse.json({ error: 'Failed to fetch league stats' }, { status: 500 });
  }
}
