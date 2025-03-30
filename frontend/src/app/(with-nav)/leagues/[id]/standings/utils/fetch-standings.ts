// utils/fetch-standings.ts
import { DivisionStandings, TeamStats } from '../types';
import { prisma } from '@/lib/prisma'; // Import Prisma client

// Moved TeamStats definition here if it's only used for this utility
// Alternatively, keep it in types.ts if used elsewhere
// interface TeamStats {
//   teamSeasonId: string;
//   teamName: string;
//   teamAbbreviation: string;
//   logoPath: string | null;
//   gamesPlayed: number;
//   wins: number;
//   losses: number;
//   otl?: number; // Add if you track overtime losses
//   points: number;
//   goalsFor: number;
//   goalsAgainst: number;
//   goalDifferential: number;
// }

/**
 * Fetches and calculates league standings directly from the database.
 * This function should be called from Server Components.
 * @param leagueShortName The short name identifier of the league (e.g., 'nhl').
 * @returns Promise<DivisionStandings[]>
 */
export async function fetchStandings(leagueShortName: string): Promise<DivisionStandings[]> {
  try {
    // --- 1. Find League, Season, LeagueSeason ---
    const league = await prisma.league.findUnique({
      where: { shortName: leagueShortName.toUpperCase() },
    });

    if (!league) {
      console.error(`League with short name '${leagueShortName}' not found`);
      return []; // Return empty array on failure
    }

    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
      orderBy: { seasonNumber: 'desc' },
    });

    if (!latestSeason) {
      console.error('No active season found');
      return [];
    }

    const leagueSeason = await prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId: league.id,
          seasonId: latestSeason.id,
        },
      },
    });

    if (!leagueSeason) {
      console.error(`LeagueSeason not found for ${league.name} in season ${latestSeason.seasonNumber}`);
      return [];
    }

    // --- 2. Fetch TeamSeasons with relevant data ---
    const teamSeasonsWithData = await prisma.teamSeason.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
      },
      include: {
        team: {
          select: {
            id: true,
            eaClubId: true,
            fullTeamName: true,
            teamAbbreviation: true,
            logoPath: true,
            primaryColor: true,
            secondaryColor: true,
            division: {
              select: {
                name: true
              }
            }
          }
        },
        matches: {
          include: {
            clubAggregateMatchStats: true,
          },
        },
      },
    });

    console.log(`[fetchStandings] Found ${teamSeasonsWithData.length} TeamSeasons for LeagueSeason ${leagueSeason.id}`);

    // --- 3. Calculate Stats for each TeamSeason ---
    const calculatedStats = new Map<string, TeamStats>();

    for (const ts of teamSeasonsWithData) {
      // Ensure team data exists before proceeding
      if (!ts.team) {
          console.warn(`[fetchStandings] TeamSeason ${ts.id} is missing related team data. Skipping.`);
          continue;
      }

      let stats: TeamStats = {
        // Use ID from the Team relation
        teamId: ts.team.id, 
        teamSeasonId: ts.id,
        teamName: ts.team.fullTeamName,
        teamAbbreviation: ts.team.teamAbbreviation,
        logoPath: ts.team.logoPath ?? null,
        // Include colors in the stats object
        primaryColor: ts.team.primaryColor ?? null,
        secondaryColor: ts.team.secondaryColor ?? null,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        // otl: 0, // Initialize if tracking OTL
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifferential: 0,
      };

      // Check if team has an EA identifier before processing matches
      const teamEAIdentifier = ts.team.eaClubId;
      if (!teamEAIdentifier) {
        console.warn(`[fetchStandings] TeamSeason ${ts.id} (${ts.team.fullTeamName}) missing EA identifier (eaClubId). Skipping match calculations.`);
        // Still add the team with 0 stats? Or skip entirely?
        // Let's add with 0 stats for now so it appears in standings.
        calculatedStats.set(ts.id, stats);
        continue; // Skip match loop for this team
      }

      for (const match of ts.matches) {
        if (match.clubAggregateMatchStats.length !== 2) {
          // This often happens if data import is incomplete or match is invalid
          console.warn(`[fetchStandings] Match ${match.id} for team ${ts.team.fullTeamName} does not have exactly 2 ClubAggregateMatchStats records. Skipping this match.`);
          continue;
        }

        const teamAggStat = match.clubAggregateMatchStats.find(
          (aggStat) => aggStat.eaTeamId.toString() === teamEAIdentifier
        );
        const opponentAggStat = match.clubAggregateMatchStats.find(
            (aggStat) => aggStat.eaTeamId.toString() !== teamEAIdentifier
          );

        if (!teamAggStat || !opponentAggStat) {
            // This indicates a potential data integrity issue
          console.warn(`[fetchStandings] Could not find own or opponent ClubAggregateMatchStats for team EA ID ${teamEAIdentifier} in Match ${match.id}. Skipping match.`);
          continue;
        }

        stats.gamesPlayed++;
        const goalsFor = teamAggStat.score;
        const goalsAgainst = opponentAggStat.score; // Use opponent's score as goalsAgainst

        // Basic W/L/Points logic (adjust if OT/SO are tracked differently)
        if (goalsFor > goalsAgainst) {
          stats.wins++;
          stats.points += 2; // Assuming 2 points for a regulation win
        } else {
          // Need logic for OT/SO losses if applicable (e.g., 1 point)
          // For now, assume any non-win is a loss (0 points)
          stats.losses++;
          // if (match.isOvertimeOrShootout) { stats.otl++; stats.points += 1; } // Example OTL logic
        }

        stats.goalsFor += goalsFor;
        stats.goalsAgainst += goalsAgainst;
      }

      // Calculate final derived stats
      stats.goalDifferential = stats.goalsFor - stats.goalsAgainst;
      // Recalculate points based on W/L/OTL if needed, otherwise simple W*2 is okay if no OTL
      // stats.points = (stats.wins * 2) + stats.otl; // Example if OTL tracked

      calculatedStats.set(ts.id, stats);
    }

    // --- 4. Group by Division ---
    const teamsByDivision = new Map<string, TeamStats[]>();

    calculatedStats.forEach((stats, teamSeasonId) => {
      const teamSeasonData = teamSeasonsWithData.find(ts => ts.id === teamSeasonId);
      // Access division name via the selected team relation
      const divisionName = teamSeasonData?.team?.division?.name ?? 'Unknown Division';

      if (!teamsByDivision.has(divisionName)) {
        teamsByDivision.set(divisionName, []);
      }
      // Use push assertion as we just checked/set the key
      teamsByDivision.get(divisionName)!.push(stats);
    });

    // --- 5. Sort Teams within Divisions ---
    teamsByDivision.forEach((teams) => {
      teams.sort((a, b) => {
        // Primary sort: Points (desc)
        if (b.points !== a.points) return b.points - a.points;
        // Tiebreaker 1: Wins (desc)
        if (b.wins !== a.wins) return b.wins - a.wins;
        // Tiebreaker 2: Goal Differential (desc)
        if (b.goalDifferential !== a.goalDifferential) return b.goalDifferential - a.goalDifferential;
        // Tiebreaker 3: Goals For (desc)
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        // Tiebreaker 4: Team Name (asc)
        return a.teamName.localeCompare(b.teamName);
      });
    });

    // --- 6. Format and Sort Divisions ---
    const standings: DivisionStandings[] = Array.from(teamsByDivision.entries()).map(([division, teams]) => ({
      division,
      teams,
    }));

    // Sort divisions alphabetically by name
    standings.sort((a, b) => a.division.localeCompare(b.division));

    return standings;

  } catch (error) {
    console.error('[fetchStandings] Error fetching or processing standings:', error);
    // Return empty array or throw error based on desired handling
    return [];
  }
}
