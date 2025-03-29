import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PositionGroup, PlayerSeason, LeagueType } from '@prisma/client'; // Ensure LeagueType is imported

export const dynamic = 'force-dynamic';

// Fisher-Yates (Knuth) Shuffle function
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


/**
 * Assign Test Players API Route
 *
 * Assigns previously created PlayerSeason records (for the latest season)
 * to TeamSeason records, respecting basic roster composition rules.
 *
 * @route POST /api/admin/assign-test-players
 * @returns {Promise<NextResponse>} JSON response with assignment status
 */
export async function POST() {
  try {
    // 1. Get Latest Season ID
    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
      select: { id: true },
    });

    if (!latestSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // 2. Fetch Available Players by Position Group
    const availablePlayers = await prisma.playerSeason.findMany({
      where: {
        seasonId: latestSeason.id,
        isInBidding: true, // Only fetch unassigned players
      },
      select: {
        id: true,
        positionGroup: true,
      },
    });

    // Separate and shuffle players by position
    let availableForwards = shuffle(availablePlayers.filter(p => p.positionGroup === PositionGroup.FORWARD));
    let availableDefense = shuffle(availablePlayers.filter(p => p.positionGroup === PositionGroup.DEFENSE));
    let availableGoalies = shuffle(availablePlayers.filter(p => p.positionGroup === PositionGroup.GOALIE));

    console.log(`Available players: ${availableForwards.length} F, ${availableDefense.length} D, ${availableGoalies.length} G`);

    // 3. Fetch TeamSeasons for the Latest Season
    const teamSeasons = await prisma.teamSeason.findMany({
      where: {
        leagueSeason: {
          seasonId: latestSeason.id,
        },
      },
      select: {
        id: true,
        // teamId: true, // No longer needed for PlayerTeamSeason creation
        forwardCount: true,
        defenseCount: true,
        goalieCount: true,
        leagueSeason: { // Need to go through LeagueSeason
          select: {
            league: { // To get the league
              select: {
                leagueType: true, // To get the leagueType for PlayerTeamSeason
              }
            }
          }
        }
      }
    });

    console.log(`Found ${teamSeasons.length} teams for the latest season.`);

    let assignmentsMade = 0;
    let teamsProcessed = 0;

    // 4. Iterate and Assign Players
    for (const teamSeason of teamSeasons) {
        const targetRoster = { F: 9, D: 6, G: 2 };
        const currentRoster = {
            F: teamSeason.forwardCount,
            D: teamSeason.defenseCount,
            G: teamSeason.goalieCount,
        };

        const neededForwards = Math.max(0, targetRoster.F - currentRoster.F);
        const neededDefense = Math.max(0, targetRoster.D - currentRoster.D);
        const neededGoalies = Math.max(0, targetRoster.G - currentRoster.G);

        const playersToAssign: { playerSeasonId: string, positionGroup: PositionGroup }[] = [];
        const playerTeamSeasonData: { 
            playerSeasonId: string; 
            teamSeasonId: string; 
            // teamId: string; // Removed this field based on schema change
            leagueType: LeagueType; 
            isPlayable: boolean; // Set default status
        }[] = [];

        // Assign Forwards
        if (neededForwards > 0) {
            if (availableForwards.length < neededForwards) {
                console.warn(`Team ${teamSeason.id} needs ${neededForwards} F, but only ${availableForwards.length} are available.`);
            }
            const assigned = availableForwards.splice(0, Math.min(neededForwards, availableForwards.length));
            playersToAssign.push(...assigned.map(p => ({ playerSeasonId: p.id, positionGroup: p.positionGroup })));
        }

        // Assign Defense
        if (neededDefense > 0) {
            if (availableDefense.length < neededDefense) {
                console.warn(`Team ${teamSeason.id} needs ${neededDefense} D, but only ${availableDefense.length} are available.`);
            }
            const assigned = availableDefense.splice(0, Math.min(neededDefense, availableDefense.length));
            playersToAssign.push(...assigned.map(p => ({ playerSeasonId: p.id, positionGroup: p.positionGroup })));
        }

        // Assign Goalies
        if (neededGoalies > 0) {
            if (availableGoalies.length < neededGoalies) {
                console.warn(`Team ${teamSeason.id} needs ${neededGoalies} G, but only ${availableGoalies.length} are available.`);
            }
            const assigned = availableGoalies.splice(0, Math.min(neededGoalies, availableGoalies.length));
            playersToAssign.push(...assigned.map(p => ({ playerSeasonId: p.id, positionGroup: p.positionGroup })));
        }

        // Prepare data for transaction if players were assigned
        if (playersToAssign.length > 0) {
            const playerSeasonIdsToUpdate = playersToAssign.map(p => p.playerSeasonId);
            let forwardIncrement = 0;
            let defenseIncrement = 0;
            let goalieIncrement = 0;

            playersToAssign.forEach(p => {
                playerTeamSeasonData.push({
                    playerSeasonId: p.playerSeasonId,
                    teamSeasonId: teamSeason.id,
                    // teamId: teamSeason.teamId, // Removed this field
                    leagueType: teamSeason.leagueSeason.league.leagueType,
                    isPlayable: true, // Assuming assigned players are playable
                });
                if (p.positionGroup === PositionGroup.FORWARD) forwardIncrement++;
                if (p.positionGroup === PositionGroup.DEFENSE) defenseIncrement++;
                if (p.positionGroup === PositionGroup.GOALIE) goalieIncrement++;
            });

            try {
                await prisma.$transaction([
                    // 1. Create the PlayerTeamSeason links
                    prisma.playerTeamSeason.createMany({
                        data: playerTeamSeasonData,
                    }),
                    // 2. Mark assigned players as not in bidding
                    prisma.playerSeason.updateMany({
                        where: { id: { in: playerSeasonIdsToUpdate } },
                        data: { isInBidding: false },
                    }),
                    // 3. Update the team's roster counts
                    prisma.teamSeason.update({
                        where: { id: teamSeason.id },
                        data: {
                            forwardCount: { increment: forwardIncrement },
                            defenseCount: { increment: defenseIncrement },
                            goalieCount: { increment: goalieIncrement },
                        },
                    }),
                ]);
                assignmentsMade += playersToAssign.length;
            } catch (txError) {
                console.error(`Transaction failed for team ${teamSeason.id}:`, txError);
                // Decide if we should re-add players to available lists or just log
            }
        }
        teamsProcessed++;
    }

    console.log(`Finished assignment process. Processed ${teamsProcessed} teams. Made ${assignmentsMade} player assignments.`);

    return NextResponse.json({ 
        message: `Player assignment completed for season ${latestSeason.id}. Assigned ${assignmentsMade} players across ${teamsProcessed} teams.` 
    });

  } catch (error) {
    console.error('Failed to assign test players:', error);
    return NextResponse.json({ error: 'Failed to assign test players' }, { status: 500 });
  }
}
