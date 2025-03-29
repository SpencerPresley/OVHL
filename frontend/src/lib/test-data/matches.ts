import { prisma } from '@/lib/prisma';
import type { Prisma, PlayerSeason, Match, TeamSeason, LeagueType, PositionGroup } from '@prisma/client';

// Helper to generate a random float between min and max, formatted to one decimal place
function randomRating(): number {
  // Generate a float between 0 and 100
  const rating = Math.random() * 100;
  // Round to one decimal place and convert back to number
  return parseFloat(rating.toFixed(1));
}

// Helper to generate random integer between min (inclusive) and max (inclusive)
function randomScore(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Input structure for the match generation helper
export interface GenerateMatchInput {
  homeTeamSeasonId: string;
  awayTeamSeasonId: string;
  homeLeagueType: LeagueType; // Needed for PlayerTeamSeason lookup/creation context
  awayLeagueType: LeagueType;
  participatingPlayerSeasons: { // Array of players involved from BOTH teams
    playerSeasonId: string;
    teamSeasonId: string; // Which TeamSeason ID they played for in *this* match
    playerName: string;   // To avoid extra lookups
    position: string;     // e.g., 'C', 'LW', 'RD', 'G'
    positionGroup: PositionGroup;
  }[];
  eaMatchId: string; // A unique identifier for the match
}

/**
 * Generates placeholder data for a single match, suitable for `prisma.match.create()`.
 * Focuses on creating the necessary records and links with default/zeroed stats.
 * 
 * NOTE: This function expects PlayerTeamSeason records to exist for the participating players
 * on their respective teams for this season. It fetches them based on playerSeasonId and teamSeasonId.
 *
 * @param {GenerateMatchInput} input - Details about the teams and players in the match.
 * @returns {Promise<Prisma.MatchCreateInput | null>} Data object for match creation or null on error.
 */
export async function generatePlaceholderMatchData(
  input: GenerateMatchInput
): Promise<Prisma.MatchCreateInput | null> {
  try {
    console.log(`Generating data for match: ${input.eaMatchId}`);

    // --- 1. Fetch PlayerTeamSeason IDs --- 
    // We need the ID of the specific PlayerTeamSeason record that links 
    // the playerSeasonId to the teamSeasonId they played for *in this match*.
    const playerTeamSeasonMap = new Map<string, string>(); // Map<playerSeasonId, playerTeamSeasonId>

    for (const player of input.participatingPlayerSeasons) {
      const pts = await prisma.playerTeamSeason.findFirst({
        where: {
          playerSeasonId: player.playerSeasonId,
          teamSeasonId: player.teamSeasonId, // Find the link for this specific team assignment
        },
        select: { id: true },
        // Consider adding error handling if a player isn't found on the specified team
      });

      if (pts) {
        playerTeamSeasonMap.set(player.playerSeasonId, pts.id);
      } else {
        console.warn(`Could not find PlayerTeamSeason for Player ${player.playerSeasonId} on TeamSeason ${player.teamSeasonId}. Skipping PlayerMatch record.`);
        // Optionally: throw error, or handle differently
      }
    }

    // --- 1.5 Generate Random Scores --- 
    const homeScore = randomScore(0, 8);
    const awayScore = randomScore(0, 8);

    // --- 2. Prepare PlayerMatch Data (Nested Create) ---
    const playerMatchData: Prisma.PlayerMatchCreateWithoutMatchInput[] = [];
    input.participatingPlayerSeasons.forEach((player) => {
      const playerTeamSeasonId = playerTeamSeasonMap.get(player.playerSeasonId);
      if (!playerTeamSeasonId) return; // Skip if we couldn't find the link

      const isHomePlayer = player.teamSeasonId === input.homeTeamSeasonId;

      playerMatchData.push({
        // Links
        playerSeason: { connect: { id: player.playerSeasonId } },
        playerTeamSeason: { connect: { id: playerTeamSeasonId } },
        // Basic Info (Defaults/Placeholders)
        playerName: player.playerName,
        position: player.position,
        playerLevel: 1, 
        posSorted: 0, 
        clientPlatform: 'psn', 
        playerLevelDisplay: 1,
        isGuest: !isHomePlayer, // isGuest means away team player
        playerDnf: false, 
        pNhlOnlineGameType: '5', 
        eaTeamId: '0', // Placeholder
        teamSide: isHomePlayer ? 1 : 0, // Home = 1, Away = 0
        opponentClubId: '0', // Placeholder
        opponentEaTeamId: '0', // Placeholder
        opponentScore: isHomePlayer ? awayScore : homeScore, 
        score: isHomePlayer ? homeScore : awayScore,
        // Player Ratings (Randomized)
        ratingDefense: randomRating(), 
        ratingOffense: randomRating(), 
        ratingTeamplay: randomRating(),
        toi: 1200, 
        toiSeconds: 1200,
        // Skater Stats (Mostly Zeroed, link goals/assists roughly to score)
        // Note: This is extremely basic, not trying for perfect realism
        goals: (isHomePlayer && homeScore > 0) || (!isHomePlayer && awayScore > 0) ? randomScore(0, 1) : 0,
        assists: (isHomePlayer && homeScore > 0) || (!isHomePlayer && awayScore > 0) ? randomScore(0, 1) : 0,
        // Other stats remain 0 for simplicity
        blockedShots: 0, deflections: 0, faceoffsLost: 0, faceoffPct: 0,
        faceoffsWon: 0, giveaways: 0, gameWinningGoals: 0, hits: 0,
        interceptions: 0, passAttempts: 0, passes: 0, passPct: 0, penaltiesDrawn: 0,
        penaltyMinutes: 0, skaterPkClearZone: 0, plusMinus: 0, possessionSeconds: 0,
        powerPlayGoals: 0, saucerPasses: 0, shortHandedGoals: 0, shotAttempts: 0,
        shotsOnNetPct: 0, shootingPct: 0, shotsOnGoal: 0, takeaways: 0, points: 0,
        faceoffsTotal: 0, shotsMissed: 0, passesMissed: 0, passingPct: 0,
        majorPenalties: 0, minorPenalties: 0, totalPenalties: 0, pointsPer60: 0,
        possessionPerMinute: 0, shotEfficiency: 0, tkawayGvawayRatio: 0,
        penaltyDifferential: 0, defActionsPerMinute: 0, offImpact: 0, defImpact: 0,
        detailedPosition: player.position, positionAbbreviation: player.position,
        gameImpactScore: 0, puckManagementRating: 0, possessionEfficiency: 0,
        netDefContribution: 0, timeAdjustedRating: 0, shotGenerationRate: 0,
        offZonePresence: 0, twoWayRating: 0,
        // Goalie Stats (Zeroed)
        breakawaySavePct: 0, breakawaySaves: 0, breakawayShots: 0,
        desperationSaves: 0, goalsAgainst: isHomePlayer ? awayScore : homeScore, // Match team GA
        goalsAgainstAverage: 0,
        penaltyShotSavePct: 0, penaltyShotSaves: 0, penaltyShotsFaced: 0,
        goaliePkClearZone: 0, pokeChecks: 0, savePct: 0, totalSaves: 0,
        totalShotsFaced: isHomePlayer ? awayScore : homeScore, // Basic: shots faced = GA
        shutoutPeriods: 0, goalsSaved: 0,
      });
    });

    // --- 3. Prepare Club Stats (Nested Create) ---
    // Use the generated scores
    const clubAggregateData: Prisma.ClubAggregateMatchStatsCreateWithoutMatchInput[] = [
        { // Home Team
            teamSide: 1, 
            score: homeScore, 
            opponentScore: awayScore, 
            goals: homeScore,        // Match score
            goalsAgainst: awayScore, // Match opponent score
            // Other fields minimal/default
            clubLevel: 1, position: 0, posSorted: 15, isGuest: 0, playerDnf: 0, playerLevel: 10,
            eaTeamId: 0, opponentEaClubId: 0, opponentEaTeamId: 0,
            ratingDefense: 0, ratingOffense: 0, ratingTeamplay: 0,
            toi: 0, toiSeconds: 0, assists: 0, blockedShots: 0, deflections: 0, faceoffsLost: 0,
            faceoffPct: 0, faceoffsWon: 0, giveaways: 0, hits: 0, interceptions: 0,
            passAttempts: 0, passes: 0, passPct: 0, penaltiesDrawn: 0, penaltyMinutes: 0,
            skaterPkClearZone: 0, plusMinus: 0, possession: 0, powerPlayGoals: 0, saucerPasses: 0,
            shortHandedGoals: 0, shotAttempts: 0, shotOnNetPct: 0, shots: homeScore, // Basic: shots = goals
            takeaways: 0,
            breakawaySavePct: 0, breakawaySaves: 0, breakawayShots: 0, desperationSaves: 0,
            goalsAgainstAverage: 0, penaltyShotSavePct: 0, penaltyShotSaves: 0,
            goaliePkClearZone: 0, pokeChecks: 0, savePct: 0, totalSaves: 0, totalShotsFaced: awayScore, // Basic
            shutoutPeriods: 0
        },
        { // Away Team
            teamSide: 0, 
            score: awayScore, 
            opponentScore: homeScore, 
            goals: awayScore,        // Match score
            goalsAgainst: homeScore, // Match opponent score
            // Other fields minimal/default
            clubLevel: 1, position: 0, posSorted: 15, isGuest: 1, playerDnf: 0, playerLevel: 10,
            eaTeamId: 0, opponentEaClubId: 0, opponentEaTeamId: 0,
            ratingDefense: 0, ratingOffense: 0, ratingTeamplay: 0,
            toi: 0, toiSeconds: 0, assists: 0, blockedShots: 0, deflections: 0, faceoffsLost: 0,
            faceoffPct: 0, faceoffsWon: 0, giveaways: 0, hits: 0, interceptions: 0,
            passAttempts: 0, passes: 0, passPct: 0, penaltiesDrawn: 0, penaltyMinutes: 0,
            skaterPkClearZone: 0, plusMinus: 0, possession: 0, powerPlayGoals: 0, saucerPasses: 0,
            shortHandedGoals: 0, shotAttempts: 0, shotOnNetPct: 0, shots: awayScore, // Basic: shots = goals
            takeaways: 0,
            breakawaySavePct: 0, breakawaySaves: 0, breakawayShots: 0, desperationSaves: 0,
            goalsAgainstAverage: 0, penaltyShotSavePct: 0, penaltyShotSaves: 0,
            goaliePkClearZone: 0, pokeChecks: 0, savePct: 0, totalSaves: 0, totalShotsFaced: homeScore, // Basic
            shutoutPeriods: 0
        }
    ];

    // --- 4. Construct Final Match Create Input --- 
    const matchCreateData: Prisma.MatchCreateInput = {
      eaMatchId: input.eaMatchId,
      // Link to one TeamSeason (e.g., home team)
      teamSeason: { connect: { id: input.homeTeamSeasonId } },
      // Link all participating PlayerSeasons via connect
      playerSeasons: {
        connect: input.participatingPlayerSeasons.map(p => ({ id: p.playerSeasonId }))
      },
      // Nested creates for related stats records
      playerStats: {
        create: playerMatchData,
      },
      clubAggregateMatchStats: {
        create: clubAggregateData,
      },
      // Skipping ClubMatchStats and MatchAnalytics for simplicity initially
    };

    console.log(`Successfully prepared data for match: ${input.eaMatchId} (Score: ${homeScore}-${awayScore})`); // Added score to log
    return matchCreateData;

  } catch (error) {
    console.error(`Error generating placeholder match data for ${input.eaMatchId}:`, error);
    return null; // Indicate failure
  }
} 