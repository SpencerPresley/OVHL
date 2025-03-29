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
    // Use league short name (e.g., 'nhl') as the identifier from the route
    const leagueShortName = resolvedParams.id;

    // Validate parameters
    const decodedCategory = category ? decodeURIComponent(category) : null;
    const parsedCategory = StatCategory.safeParse(decodedCategory);
    if (!parsedCategory.success || !leagueShortName) {
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

    // Get the League based on the short name from the URL parameter
    const league = await prisma.league.findUnique({
      where: { shortName: leagueShortName.toUpperCase() }, // Match against shortName
    });

    if (!league) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    // Get the specific LeagueSeason
    const leagueSeason = await prisma.leagueSeason.findUnique({
        where: {
            leagueId_seasonId: {
                leagueId: league.id,
                seasonId: currentSeason.id,
            },
        },
    });

    if (!leagueSeason) {
      return NextResponse.json({ error: 'League season not found for the current season' }, { status: 404 });
    }

    let stats: FormattedStat[] = [];

    if (isTeamStatCategory) {
      // Fetch team seasons for the specific league season
      const teamSeasons = await prisma.teamSeason.findMany({
        where: { leagueSeasonId: leagueSeason.id },
        include: {
          team: true, // Include team details like name, abbreviation, eaClubId
          matches: { // Include matches associated with this team season
            include: {
              // Include stats for BOTH clubs in each match to calculate PK% etc.
              clubMatchStats: true,
            },
          },
        },
      });

      stats = teamSeasons.map((teamSeason) => {
        let totalWins = 0;
        let totalPowerplayGoals = 0;
        let totalPowerplayOpportunities = 0;
        let totalShorthandedGoalsAgainst = 0;
        let totalPenaltyKillOpportunities = 0;

        teamSeason.matches.forEach((match) => {
          // Find the stats for *this* team in the match
          // Ensure team.eaClubId exists and is used for matching
          const teamStats = match.clubMatchStats.find(
            (cms) => cms.eaClubId.toString() === teamSeason.team.eaClubId
          );
          // Find the stats for the *opponent* in the match
          const opponentStats = match.clubMatchStats.find(
            (cms) => cms.eaClubId.toString() !== teamSeason.team.eaClubId
          );

          if (teamStats) {
            // WINS: Assuming result = 1 indicates a win for this team
            // Check `winnerByDnf` as well? Let's stick to `result` for now.
            if (teamStats.result === 1) {
              totalWins++;
            }
            // POWERPLAY
            totalPowerplayGoals += teamStats.powerplayGoals || 0;
            totalPowerplayOpportunities += teamStats.powerplayOpportunities || 0;
          }

          if(opponentStats) {
            // PENALTY KILL: Use opponent's PP stats
            // Opponent's PP goals = Shorthanded goals against for our team
            totalShorthandedGoalsAgainst += opponentStats.powerplayGoals || 0;
            // Opponent's PP opportunities = Times our team was shorthanded
            totalPenaltyKillOpportunities += opponentStats.powerplayOpportunities || 0;
          }
        });

        let value = 0;
        switch (statCategory) {
          case 'WINS':
            value = totalWins;
            break;
          case 'POWERPLAY':
            // Avoid division by zero
            value = totalPowerplayOpportunities > 0 ? totalPowerplayGoals / totalPowerplayOpportunities : 0;
            break;
          case 'PENALTYKILL':
            // PK% = 1 - (Opponent PP Goals / Opponent PP Opportunities)
            // Avoid division by zero, default to 1 (100%) if no opportunities
            value = totalPenaltyKillOpportunities > 0 ? 1 - (totalShorthandedGoalsAgainst / totalPenaltyKillOpportunities) : 1;
            break;
        }

        return {
          id: teamSeason.team.id,
          name: teamSeason.team.fullTeamName, // Use correct field name
          value,
          formattedValue: formatStatValue(value, statCategory),
          teamIdentifier: teamSeason.team.teamAbbreviation, // Use correct field name
          isTeamStat: true,
        };
      });
    } else {
        // Fetch player seasons active in the current season and part of the target league season
        const playerSeasons = await prisma.playerSeason.findMany({
            where: {
            seasonId: currentSeason.id,
            // Filter by players associated with a TeamSeason in the target LeagueSeason
            teamSeasons: {
                some: {
                    teamSeason: {
                        leagueSeasonId: leagueSeason.id,
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
            playerMatches: true, // Include all player match stats for aggregation
            // Include the link to get the *current* team information via PlayerTeamSeason
            teamSeasons: {
                orderBy: { createdAt: 'desc' }, // Assuming the latest PlayerTeamSeason is the current one
                take: 1,
                include: {
                    teamSeason: {
                        include: {
                            team: true // Need team abbreviation
                        }
                    }
                }
            }
            },
        });


        stats = playerSeasons.map((playerSeason) => {
            let totalGoals = 0;
            let totalAssists = 0;
            let totalPlusMinus = 0;
            let totalSaves = 0;
            let totalGoalsAgainst = 0;
            let totalShotsFaced = 0;
            let totaltoiSeconds = 0;
            // gamesPlayed could be approximated by playerMatches.length, but toiSeconds is better for GAA/SV%

            playerSeason.playerMatches.forEach((pm) => {
                totalGoals += pm.goals || 0;
                totalAssists += pm.assists || 0;
                totalPlusMinus += pm.plusMinus || 0;
                totalSaves += pm.totalSaves || 0;
                totalGoalsAgainst += pm.goalsAgainst || 0;
                totalShotsFaced += pm.totalShotsFaced || 0;
                totaltoiSeconds += pm.toiSeconds || 0;
            });

            let value = 0;
            switch (statCategory) {
                case 'POINTS':
                    value = totalGoals + totalAssists;
                    break;
                case 'GOALS':
                    value = totalGoals;
                    break;
                case 'ASSISTS':
                    value = totalAssists;
                    break;
                case 'PLUSMINUS':
                    value = totalPlusMinus;
                    break;
                case 'SAVEPCT':
                    // Use totalShotsFaced for calculation. Avoid division by zero.
                    value = totalShotsFaced > 0 ? totalSaves / totalShotsFaced : 0;
                    break;
                case 'GAA':
                    // GAA = (Goals Against * Seconds in Hour) / Seconds Played
                    // Avoid division by zero.
                    value = totaltoiSeconds > 0 ? (totalGoalsAgainst * 3600) / totaltoiSeconds : 0;
                    break;
            }

            // Get current team info from the nested relation fetched
            const currentTeamSeasonRelation = playerSeason.teamSeasons[0];
            const currentTeam = currentTeamSeasonRelation?.teamSeason?.team;

            return {
                id: playerSeason.player.id,
                name: playerSeason.player.name,
                gamertag: playerSeason.player.gamertags[0]?.gamertag || playerSeason.player.name,
                value,
                formattedValue: formatStatValue(value, statCategory),
                // Use the abbreviation from the fetched current team, fallback to 'FA'
                teamIdentifier: currentTeam?.teamAbbreviation || 'FA',
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
    // Provide more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: `Failed to fetch league stats: ${errorMessage}` }, { status: 500 });
  }
}
