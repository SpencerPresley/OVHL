import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth'; // Import admin check
import { generatePlaceholderMatchData } from '@/lib/test-data/matches'; // Import helper
import { PositionGroup, type TeamSeason, type League, type PlayerSeason, type LeagueType, type PlayerTeamSeason } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // For generating unique EA Match IDs

export const dynamic = 'force-dynamic';

// Define a type for easier handling of team data with league info
type TeamSeasonWithLeague = TeamSeason & {
    leagueSeason: {
        league: Pick<League, 'id' | 'shortName' | 'leagueType'>;
    };
};

// Define a type for player details needed for selection
type PlayerDetails = {
    playerSeasonId: string;
    playerName: string;
    position: string;
    positionGroup: PositionGroup;
};

// Helper function to shuffle an array (used for random team selection)
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

/**
 * Create Test Matches API Route
 *
 * Generates placeholder match records for the latest season, 
 * attempting to fulfill game counts per team per league.
 *
 * @route POST /api/admin/create-test-matches
 * @returns {Promise<NextResponse>} JSON response with creation status
 */
export async function POST() {
  try {
    // 1. Verify Admin Authentication
    await requireAdmin();

    // 2. Get Latest Season ID
    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
      select: { id: true },
    });

    if (!latestSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }
    console.log(`Latest Season ID: ${latestSeason.id}`);

    // 3. Fetch All TeamSeasons for the Latest Season with League Info
    const allTeamSeasons: TeamSeasonWithLeague[] = await prisma.teamSeason.findMany({
        where: {
            leagueSeason: {
                seasonId: latestSeason.id,
            },
        },
        include: {
            leagueSeason: {
                include: {
                    league: {
                        select: {
                            id: true,
                            shortName: true,
                            leagueType: true,
                        }
                    }
                }
            }
        }
    });

    if (!allTeamSeasons || allTeamSeasons.length === 0) {
        return NextResponse.json({ error: 'No teams found for the latest season. Run season setup/assignment first?' }, { status: 404 });
    }

    // 4. Group TeamSeasons by League Short Name
    const teamsByLeague: Record<string, TeamSeasonWithLeague[]> = {};
    for (const ts of allTeamSeasons) {
        const leagueShortName = ts.leagueSeason.league.shortName;
        if (!teamsByLeague[leagueShortName]) {
            teamsByLeague[leagueShortName] = [];
        }
        teamsByLeague[leagueShortName].push(ts);
    }
    console.log(`Found teams in leagues: ${Object.keys(teamsByLeague).join(', ')}`);

    // 5. Fetch Rosters for all teams
    console.log('Fetching rosters...');
    const rostersMap = new Map<string, PlayerDetails[]>(); // Map<teamSeasonId, PlayerDetails[]>
    const allPlayerSeasonIds = new Set<string>();
    for (const ts of allTeamSeasons) {
        const roster = await prisma.playerTeamSeason.findMany({
            where: { teamSeasonId: ts.id },
            include: {
                playerSeason: {
                    select: {
                        id: true,
                        // Fetch user name via player->user relation if needed, or use PlayerSeason name if exists
                        // Assuming PlayerSeason doesn't have name, go via user:
                        user: { select: { name: true } }, 
                        primaryPosition: true,
                        positionGroup: true,
                    }
                }
            }
        });
        const playerDetails: PlayerDetails[] = roster.map(r => {
            allPlayerSeasonIds.add(r.playerSeason.id);
            return {
                playerSeasonId: r.playerSeason.id,
                playerName: r.playerSeason.user?.name ?? 'UnknownPlayer',
                position: r.playerSeason.primaryPosition,
                positionGroup: r.playerSeason.positionGroup,
            }
        });
        rostersMap.set(ts.id, playerDetails);
    }
    console.log(`Fetched rosters for ${rostersMap.size} teams.`);

    // 6. Initialize Counters
    const teamGamesPlayed = new Map<string, number>();
    allTeamSeasons.forEach(ts => teamGamesPlayed.set(ts.id, 0));

    const playerGamesPlayed = new Map<string, number>();
    allPlayerSeasonIds.forEach(psId => playerGamesPlayed.set(psId, 0));

    let totalMatchesCreated = 0;
    const MAX_MATCHUP_ATTEMPTS = 50000; // Safety break for matchup finding

    // 7. Loop Through Leagues and Generate Matches
    for (const leagueShortName in teamsByLeague) {
        const leagueTeams = teamsByLeague[leagueShortName];
        if (leagueTeams.length < 2) {
            console.log(`Skipping league ${leagueShortName}, not enough teams.`);
            continue;
        }

        const isCHL = leagueTeams[0].leagueSeason.league.leagueType === 'CHL';
        const gamesPerTeam = isCHL ? 72 : 82;
        const totalGamesToGenerate = Math.ceil((leagueTeams.length * gamesPerTeam) / 2);
        let leagueGamesGenerated = 0;
        let matchupAttempts = 0;

        console.log(`Generating ${totalGamesToGenerate} matches for ${leagueShortName} (${leagueTeams.length} teams, ${gamesPerTeam} games each)...`);

        // Shuffle teams for better random pairing initially
        let shuffledTeams = shuffle(leagueTeams.map(t => t.id)); 

        while (leagueGamesGenerated < totalGamesToGenerate && matchupAttempts < MAX_MATCHUP_ATTEMPTS) {
            matchupAttempts++;

            // Simple random matchup selection
            if (shuffledTeams.length < 2) {
                 // Reset if needed, though ideally we pick teams that need games
                 shuffledTeams = shuffle(leagueTeams.map(t => t.id));
            }
            const potentialHomeId = shuffledTeams[0];
            const potentialAwayId = shuffledTeams[1];
            
            // Prioritize teams that need games - Simple check
            if (teamGamesPlayed.get(potentialHomeId)! >= gamesPerTeam || teamGamesPlayed.get(potentialAwayId)! >= gamesPerTeam) {
                // Put teams back and reshuffle to try different pairs
                shuffledTeams = shuffle(shuffledTeams);
                continue; 
            }

            // Valid matchup found (basic check)
            const homeTeamId = potentialHomeId;
            const awayTeamId = potentialAwayId;
            const homeTeam = leagueTeams.find(t => t.id === homeTeamId)!;
            const awayTeam = leagueTeams.find(t => t.id === awayTeamId)!;

            // 8. Select Players (Rotation Logic)
            const homeRoster = rostersMap.get(homeTeamId) ?? [];
            const awayRoster = rostersMap.get(awayTeamId) ?? [];

            const selectPlayers = (roster: PlayerDetails[], targetF: number, targetD: number, targetG: number) => {
                const forwards = roster.filter(p => p.positionGroup === PositionGroup.FORWARD)
                                    .sort((a, b) => (playerGamesPlayed.get(a.playerSeasonId) ?? 0) - (playerGamesPlayed.get(b.playerSeasonId) ?? 0));
                const defense = roster.filter(p => p.positionGroup === PositionGroup.DEFENSE)
                                    .sort((a, b) => (playerGamesPlayed.get(a.playerSeasonId) ?? 0) - (playerGamesPlayed.get(b.playerSeasonId) ?? 0));
                const goalies = roster.filter(p => p.positionGroup === PositionGroup.GOALIE)
                                    .sort((a, b) => (playerGamesPlayed.get(a.playerSeasonId) ?? 0) - (playerGamesPlayed.get(b.playerSeasonId) ?? 0));
                
                // Ensure we don't try to select more players than available
                return [
                    ...forwards.slice(0, Math.min(targetF, forwards.length)),
                    ...defense.slice(0, Math.min(targetD, defense.length)),
                    ...goalies.slice(0, Math.min(targetG, goalies.length)),
                ];
            };

            const homePlayers = selectPlayers(homeRoster, 9, 6, 2);
            const awayPlayers = selectPlayers(awayRoster, 9, 6, 2);

            if (homePlayers.length < 1 || awayPlayers.length < 1) {
                 console.warn(`Skipping match ${homeTeam.leagueSeason.league.shortName} ${leagueGamesGenerated + 1}: Not enough players found for rotation for team ${homeTeamId} or ${awayTeamId}. Check assignment.`);
                 continue; // Skip this matchup if rosters are empty/incomplete
            }

            const participatingPlayerSeasons = [
                ...homePlayers.map(p => ({ ...p, teamSeasonId: homeTeamId })),
                ...awayPlayers.map(p => ({ ...p, teamSeasonId: awayTeamId }))
            ];

            // 9. Generate Match ID & Call Helper
            const uniqueMatchId = `TEST-${leagueShortName}-${uuidv4()}`;
            const matchInputData = await generatePlaceholderMatchData({
                homeTeamSeasonId: homeTeamId,
                awayTeamSeasonId: awayTeamId,
                homeLeagueType: homeTeam.leagueSeason.league.leagueType,
                awayLeagueType: awayTeam.leagueSeason.league.leagueType,
                participatingPlayerSeasons: participatingPlayerSeasons,
                eaMatchId: uniqueMatchId,
            });

            // 10. Create Match & Update Counters
            if (matchInputData) {
                try {
                    await prisma.match.create({ data: matchInputData });
                    
                    // Increment counters
                    teamGamesPlayed.set(homeTeamId, teamGamesPlayed.get(homeTeamId)! + 1);
                    teamGamesPlayed.set(awayTeamId, teamGamesPlayed.get(awayTeamId)! + 1);
                    participatingPlayerSeasons.forEach(p => {
                        playerGamesPlayed.set(p.playerSeasonId, (playerGamesPlayed.get(p.playerSeasonId) ?? 0) + 1);
                    });

                    leagueGamesGenerated++;
                    totalMatchesCreated++;

                    // Simple progress log
                    if (leagueGamesGenerated % 50 === 0) {
                        console.log(`Generated ${leagueGamesGenerated}/${totalGamesToGenerate} matches for ${leagueShortName}...`);
                    }

                } catch (dbError) {
                    console.error(`Failed to create match ${uniqueMatchId} in DB:`, dbError);
                    // Optionally break or implement retry logic
                }
            } else {
                console.error(`Helper function failed to generate data for match ${uniqueMatchId}`);
            }
            // Reshuffle for next potential matchup
            shuffledTeams = shuffle(shuffledTeams); 
        }

        if (matchupAttempts >= MAX_MATCHUP_ATTEMPTS) {
            console.warn(`Reached max matchup attempts (${MAX_MATCHUP_ATTEMPTS}) for league ${leagueShortName}. Generated ${leagueGamesGenerated}/${totalGamesToGenerate} matches.`);
        }
         console.log(`Finished generating matches for ${leagueShortName}. Total: ${leagueGamesGenerated}`);
    }

    // Final Summary
    console.log(`Total matches created across all leagues: ${totalMatchesCreated}`);
    // Optionally log average player games played etc.

    return NextResponse.json({ 
        message: `Test match generation complete. Created ${totalMatchesCreated} matches across ${Object.keys(teamsByLeague).length} leagues.`, // Updated message
        matchesCreated: totalMatchesCreated 
    });

  } catch (error) {
    console.error('Failed to create test matches:', error);
    // Handle specific errors like auth failures
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Failed to create test matches' }, { status: 500 });
  }
}
