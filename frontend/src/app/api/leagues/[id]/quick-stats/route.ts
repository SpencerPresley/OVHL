/**
 * @file quick-stats/route.ts
 * @author Spencer Presley
 * @version 1.1.0
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
 * and formatting of league statistics *for all categories* in a single response.
 *
 * Features:
 * - Top 10 player/team stats formatting for all categories
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
 * - Efficient database queries with proper joins (fetched once)
 * - Modular stat processing functions
 * - Clear separation from core business logic
 *
 * Performance Considerations:
 * - Base data fetched only once per request
 * - Minimal data transformation overhead
 * - Efficient query patterns
 * - Response size optimization (top 10 limit per category)
 *
 * @example
 * // Component usage
 * fetch('/api/leagues/nhl/quick-stats')
 *   .then(res => res.json())
 *   .then(data => {
 *      // data.stats will contain { POINTS: [...], GOALS: [...], ... }
 *      updateStatsDisplay(data.stats);
 *  });
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * Represents the different categories of statistics that can be queried
 * Still useful for defining the categories to process
 */
export const StatCategories = [
  'POINTS',
  'GOALS',
  'ASSISTS',
  'PLUSMINUS',
  'SAVEPCT',
  'GAA',
  'WINS',
  'POWERPLAY',
  'PENALTYKILL',
] as const; // Use const assertion for stricter typing

export type StatCategory = typeof StatCategories[number]; // Derive type from array

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

// Type for the final response structure
type AllFormattedStats = Partial<Record<StatCategory, FormattedStat[]>>;

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
  if (value === null || value === undefined || isNaN(value)) return 'N/A'; // Handle invalid inputs

  if (category === 'SAVEPCT' || category === 'POWERPLAY' || category === 'PENALTYKILL') {
    // Ensure PK% doesn't go below 0 due to floating point issues if calculated as 1 - x
     if (category === 'PENALTYKILL' && value < 0) value = 0;
    return `${(value * 100).toFixed(1)}%`;
  }
  if (category === 'GAA') {
    return value.toFixed(2);
  }
  if (category === 'PLUSMINUS') {
     // Explicitly handle 0 case if desired, otherwise just format non-zero
    if (value > 0) return `+${value}`;
    return value.toString(); // Handles negative and zero
  }
  return value.toString();
}

// --- Helper functions to calculate raw stat values ---

// Calculate value for a TeamStat category
function calculateTeamStatValue(teamSeasonData: any, category: StatCategory): number {
    let totalWins = 0;
    let totalPowerplayGoals = 0;
    let totalPowerplayOpportunities = 0;
    let totalShorthandedGoalsAgainst = 0;
    let totalPenaltyKillOpportunities = 0;

    teamSeasonData.matches.forEach((match: any) => {
      const teamStats = match.clubMatchStats.find(
        (cms: any) => cms.eaClubId.toString() === teamSeasonData.team.eaClubId
      );
      const opponentStats = match.clubMatchStats.find(
        (cms: any) => cms.eaClubId.toString() !== teamSeasonData.team.eaClubId
      );

      if (teamStats) {
        if (teamStats.result === 1) totalWins++;
        totalPowerplayGoals += teamStats.powerplayGoals || 0;
        totalPowerplayOpportunities += teamStats.powerplayOpportunities || 0;
      }

      if(opponentStats) {
        totalShorthandedGoalsAgainst += opponentStats.powerplayGoals || 0;
        totalPenaltyKillOpportunities += opponentStats.powerplayOpportunities || 0;
      }
    });

    switch (category) {
      case 'WINS':
        return totalWins;
      case 'POWERPLAY':
        return totalPowerplayOpportunities > 0 ? totalPowerplayGoals / totalPowerplayOpportunities : 0;
      case 'PENALTYKILL':
        // Ensure PK% is between 0 and 1
        const pkValue = totalPenaltyKillOpportunities > 0 ? 1 - (totalShorthandedGoalsAgainst / totalPenaltyKillOpportunities) : 1;
        return Math.max(0, Math.min(1, pkValue)); // Clamp between 0 and 1
      default: return 0; // Should not happen for team stats
    }
}

// Calculate value for a PlayerStat category
function calculatePlayerStatValue(playerSeasonData: any, category: StatCategory): number {
    let totalGoals = 0;
    let totalAssists = 0;
    let totalPlusMinus = 0;
    let totalSaves = 0;
    let totalGoalsAgainst = 0;
    let totalShotsFaced = 0;
    let totaltoiSeconds = 0;

    playerSeasonData.playerMatches.forEach((pm: any) => {
        totalGoals += pm.goals || 0;
        totalAssists += pm.assists || 0;
        totalPlusMinus += pm.plusMinus || 0;
        totalSaves += pm.totalSaves || 0;
        totalGoalsAgainst += pm.goalsAgainst || 0;
        totalShotsFaced += pm.totalShotsFaced || 0;
        totaltoiSeconds += pm.toiSeconds || 0;
    });

    switch (category) {
        case 'POINTS':
            return totalGoals + totalAssists;
        case 'GOALS':
            return totalGoals;
        case 'ASSISTS':
            return totalAssists;
        case 'PLUSMINUS':
            return totalPlusMinus;
        case 'SAVEPCT':
            // Ensure shots faced is not zero and saves are not negative
            return totalShotsFaced > 0 ? Math.max(0, totalSaves) / totalShotsFaced : 0;
        case 'GAA':
             // Ensure toiSeconds is positive
            return totaltoiSeconds > 0 ? (Math.max(0, totalGoalsAgainst) * 3600) / totaltoiSeconds : 0;
        default: return 0; // Should not happen for player stats
    }
}


/**
 * GET handler for league quick stats
 * Processes and formats league statistics for frontend display *for all categories*.
 *
 * Features:
 * - League-specific stat filtering
 * - Calculates all categories in one go
 * - Top 10 limitation per category
 * - Formatted values for UI presentation
 *
 * Note: This endpoint is intentionally frontend-focused and handles
 * UI-specific transformations. Core stat calculations should be moved
 * to the backend service when implemented.
 *
 * @param request - The incoming request object
 * @param params - Route parameters including league ID
 * @returns Formatted stats object keyed by category for frontend display
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params;
    const leagueShortName = resolvedParams.id;

    // Validate league short name presence
    if (!leagueShortName) {
      return NextResponse.json({ error: 'League ID parameter is missing' }, { status: 400 });
    }

    // --- Fetch Base Data Once ---
    const currentSeason = await prisma.season.findFirst({ where: { isLatest: true } });
    if (!currentSeason) return NextResponse.json({ error: 'No active season found' }, { status: 404 });

    const league = await prisma.league.findUnique({ where: { shortName: leagueShortName.toUpperCase() } });
    if (!league) return NextResponse.json({ error: 'League not found' }, { status: 404 });

    const leagueSeason = await prisma.leagueSeason.findUnique({
        where: { leagueId_seasonId: { leagueId: league.id, seasonId: currentSeason.id } },
    });
    if (!leagueSeason) return NextResponse.json({ error: 'League season not found for the current season' }, { status: 404 });

    // Fetch Team Seasons Data (including necessary relations for calculations)
    const teamSeasonsData = await prisma.teamSeason.findMany({
      where: { leagueSeasonId: leagueSeason.id },
      include: {
        team: true,
        matches: { include: { clubMatchStats: true } }, // Include match stats for calculations
      },
    });

    // Fetch Player Seasons Data (including necessary relations for calculations)
     const playerSeasonsData = await prisma.playerSeason.findMany({
        where: {
        seasonId: currentSeason.id,
        teamSeasons: { some: { team: { leagueSeasonId: leagueSeason.id } } },
        },
        include: {
        user: { include: { gamertags: { orderBy: { createdAt: 'desc' }, take: 1 } } },
        playerMatches: true, // Need all matches for aggregation
        teamSeasons: { // Need current team info
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { team: { include: { team: true } } },
        },
        },
    });

    // --- Process Data for Each Category ---
    const allFormattedStats: AllFormattedStats = {};

    for (const category of StatCategories) {
        let processedStats: Omit<FormattedStat, 'formattedValue'>[] = []; // Intermediate array before formatting
        const isTeamStatCategory = ['WINS', 'POWERPLAY', 'PENALTYKILL'].includes(category);

        if (isTeamStatCategory) {
            processedStats = teamSeasonsData.map((ts) => ({
                id: ts.team.id,
                name: ts.team.fullTeamName,
                value: calculateTeamStatValue(ts, category),
                teamIdentifier: ts.team.teamAbbreviation,
                isTeamStat: true,
            }));
        } else { // Player Stats
            processedStats = playerSeasonsData
                .map((ps) => {
                     const playerUser = ps.user;
                     if (!playerUser) return null; // Skip if user data is missing

                     const currentTeamSeasonRelation = ps.teamSeasons[0];
                     const currentTeam = currentTeamSeasonRelation?.team?.team;

                     return {
                        id: playerUser.id,
                        name: playerUser.name || 'Unnamed Player',
                        gamertag: playerUser.gamertags[0]?.gamertag || playerUser.name || 'Unknown',
                        value: calculatePlayerStatValue(ps, category),
                        teamIdentifier: currentTeam?.teamAbbreviation || 'FA',
                        isTeamStat: false,
                     };
                })
                .filter((stat): stat is Omit<FormattedStat, 'formattedValue'> => stat !== null); // Filter out nulls from missing users
        }

        // Sort stats (ascending for GAA, descending otherwise)
        processedStats.sort((a, b) => (category === 'GAA' ? a.value - b.value : b.value - a.value));

        // Take top 10 and apply final formatting
        const top10Stats: FormattedStat[] = processedStats
            .slice(0, 10)
            .map(stat => ({
                ...stat,
                formattedValue: formatStatValue(stat.value, category),
            }));

        allFormattedStats[category] = top10Stats;
    } // End category loop

    // Return the consolidated stats object
    return NextResponse.json({ stats: allFormattedStats });

  } catch (error) {
    console.error('Failed to fetch league stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: `Failed to fetch league stats: ${errorMessage}` }, { status: 500 });
  }
}
