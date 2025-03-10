import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';
import { biddingUtils } from '@/lib/redis';
import { NotificationType } from '@prisma/client';
import { UserService } from '@/lib/services/user-service';

const prisma = new PrismaClient();

// Helper to check if the user is a team manager
const isTeamManager = async (userId: string, teamId: string) => {
  const manager = await prisma.teamManager.findFirst({
    where: {
      userId,
      teamId,
    },
  });

  return !!manager;
};

// Helper to check if the current league is in an active bidding period
const isLeagueInBidding = async (leagueId: string) => {
  const status = await biddingUtils.getLeagueBiddingStatus(leagueId);
  return status && status.active;
};

// Helper function to send notifications to team managers when outbid
async function sendOutbidNotifications(
  outbidInfo: {
    outbidTeamId: string;
    outbidTeamName: string;
    previousBidAmount: number;
    playerName: string;
  },
  newBidAmount: number,
  newTeamName: string
) {
  try {
    // Get all managers for the outbid team
    const teamManagers = await prisma.teamManager.findMany({
      where: {
        teamId: outbidInfo.outbidTeamId,
      },
      include: {
        user: true,
      },
    });

    // Send notification to each manager - without revealing the competing team
    const notificationPromises = teamManagers.map((manager) => {
      return UserService.createNotification({
        userId: manager.userId,
        type: NotificationType.TEAM,
        title: 'You have been outbid!',
        message: `Your team (${outbidInfo.outbidTeamName}) has been outbid on ${outbidInfo.playerName} with a bid of $${newBidAmount.toLocaleString()}.`,
        metadata: {
          playerName: outbidInfo.playerName,
          previousBid: outbidInfo.previousBidAmount,
          newBid: newBidAmount,
          outbidTeamId: outbidInfo.outbidTeamId,
          outbidTeamName: outbidInfo.outbidTeamName,
          // Removed newTeamName to preserve bidding privacy
        },
      });
    });

    await Promise.all(notificationPromises);
    console.log(
      `Sent outbid notifications to ${teamManagers.length} managers of ${outbidInfo.outbidTeamName}`
    );
  } catch (error) {
    console.error('Error sending outbid notifications:', error);
    // Don't throw - we want the bid to succeed even if notifications fail
  }
}

// GET /api/bidding?leagueId=nhl
// Get all bidding data for a league
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('leagueId');
  const teamId = searchParams.get('teamId');

  if (!leagueId) {
    return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
  }

  try {
    // Get the current tier for this league
    const tier = await prisma.tier.findFirst({
      where: {
        name: leagueId.toUpperCase(),
        season: {
          isLatest: true,
        },
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Get all players in bidding for this tier
    const biddingPlayers = await biddingUtils.getPlayersByTier(tier.id);

    // If teamId is provided, also get team-specific data
    let teamData = null;
    if (teamId) {
      const session = await getServerSession(AuthOptions);

      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Check if user is a manager for this team
      const isManager = await isTeamManager(session.user.id, teamId);

      if (!isManager) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Get the team's current committed bids
      const committedBids = await biddingUtils.getTeamCommittedBids(teamId);

      console.log('Team committed bids:', {
        teamId,
        totalCommitted: committedBids.totalCommitted,
        activeBidsCount: committedBids.activeBids.length,
        activeBids: committedBids.activeBids.map((bid) => ({
          playerName: bid.playerName,
          amount: bid.amount,
          position: bid.position,
        })),
      });

      // TODO: Future improvement - Store committed bids in the database
      // This would involve:
      // 1. Creating a table to track active bids
      // 2. Updating it whenever a bid is placed
      // 3. Querying the database here instead of Redis
      // Benefits: More consistent data across restarts, better backup/recovery

      // Get the team's won players
      const teamSeason = await prisma.teamSeason.findFirst({
        where: {
          teamId,
          tierId: tier.id,
        },
        include: {
          players: {
            include: {
              playerSeason: {
                include: {
                  contract: true,
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
            },
          },
        },
      });

      if (teamSeason) {
        // Calculate current salary from player contracts
        const currentSalary = teamSeason.players.reduce(
          (sum, p) => sum + p.playerSeason.contract.amount,
          0
        );

        teamData = {
          activeBids: committedBids.activeBids,
          // Ensure totalCommitted is a number
          totalCommitted: Number(committedBids.totalCommitted) || 0,
          roster: teamSeason.players.map((p) => ({
            id: p.playerSeason.id,
            name: p.playerSeason.player.name,
            position: p.playerSeason.position,
            gamertag: p.playerSeason.player.gamertags[0]?.gamertag || p.playerSeason.player.name,
            contractAmount: p.playerSeason.contract.amount,
          })),
          salaryCap: tier.salaryCap,
          currentSalary: currentSalary,
        };

        console.log('Team data being returned:', {
          activeBidsCount: teamData.activeBids.length,
          totalCommitted: teamData.totalCommitted,
          rosterSize: teamData.roster.length,
          salaryCap: teamData.salaryCap,
          currentSalary: teamData.currentSalary,
        });
      }
    }

    // Get bidding status for this league
    const biddingStatus = await biddingUtils.getLeagueBiddingStatus(leagueId);

    return NextResponse.json({
      biddingPlayers,
      biddingStatus,
      teamData,
      tierId: tier.id,
    });
  } catch (error) {
    console.error('Error fetching bidding data:', error);
    return NextResponse.json({ error: 'Failed to fetch bidding data' }, { status: 500 });
  }
}

// POST /api/bidding
// Place a bid on a player
export async function POST(request: NextRequest) {
  const session = await getServerSession(AuthOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { playerSeasonId, teamId, amount, leagueId } = body;

    if (!playerSeasonId || !teamId || !amount || !leagueId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is a manager for this team
    const isManager = await isTeamManager(session.user.id, teamId);

    if (!isManager) {
      return NextResponse.json(
        { error: 'You are not authorized to bid for this team' },
        { status: 403 }
      );
    }

    // Check if the league is in an active bidding period
    const isActive = await isLeagueInBidding(leagueId);

    if (!isActive) {
      return NextResponse.json(
        { error: 'Bidding is not currently active for this league' },
        { status: 400 }
      );
    }

    // Get team data for the bid
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get current season and tier
    const tier = await prisma.tier.findFirst({
      where: {
        name: leagueId.toUpperCase(),
        season: {
          isLatest: true,
        },
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Get the team's season record
    const teamSeason = await prisma.teamSeason.findFirst({
      where: {
        teamId,
        tierId: tier.id,
      },
      include: {
        players: {
          include: {
            playerSeason: {
              include: {
                contract: true,
              },
            },
          },
        },
      },
    });

    if (!teamSeason) {
      return NextResponse.json({ error: 'Team not registered for this season' }, { status: 400 });
    }

    // Get team's current committed bids
    const committedBids = await biddingUtils.getTeamCommittedBids(teamId);

    // Calculate current salary from player contracts
    const currentSalary = teamSeason.players.reduce(
      (sum, p) => sum + p.playerSeason.contract.amount,
      0
    );

    // Get roster counts
    const forwards = teamSeason.players.filter((p) =>
      ['LW', 'C', 'RW'].includes(p.playerSeason.position)
    ).length;

    const defense = teamSeason.players.filter((p) =>
      ['LD', 'RD'].includes(p.playerSeason.position)
    ).length;

    const goalies = teamSeason.players.filter((p) => p.playerSeason.position === 'G').length;

    // Get the player's position from Redis
    const playerBidding = await biddingUtils.getPlayerBidding(playerSeasonId);
    if (!playerBidding) {
      return NextResponse.json({ error: 'Player not found in bidding' }, { status: 404 });
    }

    const playerPosition = playerBidding.position;
    const isForward = ['LW', 'C', 'RW'].includes(playerPosition);
    const isDefense = ['LD', 'RD'].includes(playerPosition);
    const isGoalie = playerPosition === 'G';

    // Salary cap validation
    const totalCurrentCommitments = currentSalary + committedBids.totalCommitted;
    const proposedTotal = totalCurrentCommitments + amount;

    // If they have an active bid on this player, subtract that amount
    const existingBidOnThisPlayer = committedBids.activeBids.find(
      (bid) => bid.playerSeasonId === playerSeasonId
    );

    const adjustedProposedTotal = existingBidOnThisPlayer
      ? proposedTotal - existingBidOnThisPlayer.amount
      : proposedTotal;

    if (adjustedProposedTotal > tier.salaryCap) {
      return NextResponse.json(
        {
          error: `This bid would put your team over the salary cap of $${tier.salaryCap.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    // Minimum roster requirements calculation
    const MIN_SALARY = 500000; // Minimum contract of $500k
    const MIN_FORWARDS = 9;
    const MIN_DEFENSE = 6;
    const MIN_GOALIES = 2;

    // Calculate minimum required for the remaining roster spots
    const remainingForwardsNeeded = Math.max(0, MIN_FORWARDS - forwards);
    const remainingDefenseNeeded = Math.max(0, MIN_DEFENSE - defense);
    const remainingGoaliesNeeded = Math.max(0, MIN_GOALIES - goalies);

    // Calculate minimum budget needed for the remaining roster
    const minBudgetForRemainingRoster =
      remainingForwardsNeeded * MIN_SALARY +
      remainingDefenseNeeded * MIN_SALARY +
      remainingGoaliesNeeded * MIN_SALARY;

    // Calculate remaining cap after proposed bid
    const remainingAfterBid = tier.salaryCap - adjustedProposedTotal;

    // Check if making this bid would leave enough cap space for minimum roster
    if (remainingAfterBid < minBudgetForRemainingRoster) {
      let positionNeeded = '';
      if (remainingForwardsNeeded > 0) positionNeeded += `${remainingForwardsNeeded} forwards, `;
      if (remainingDefenseNeeded > 0) positionNeeded += `${remainingDefenseNeeded} defense, `;
      if (remainingGoaliesNeeded > 0) positionNeeded += `${remainingGoaliesNeeded} goalies, `;
      positionNeeded = positionNeeded.replace(/, $/, '');

      return NextResponse.json(
        {
          error: `This bid would not leave enough cap space to complete your roster. You still need ${positionNeeded} at minimum salary (${minBudgetForRemainingRoster.toLocaleString()}).`,
        },
        { status: 400 }
      );
    }

    // Place the bid
    const updatedBidding = await biddingUtils.placeBid(playerSeasonId, {
      teamId,
      teamName: team.officialName,
      amount,
      teamSeasonId: teamSeason.id,
    });

    // If someone was outbid, send notifications
    if (updatedBidding.outbid) {
      await sendOutbidNotifications(updatedBidding.outbid, amount, team.officialName);
    }

    console.log('Bid placed successfully:', {
      playerSeasonId,
      playerName: updatedBidding.playerName,
      teamId,
      teamName: team.officialName,
      amount,
      currentBid: updatedBidding.currentBid,
      status: updatedBidding.status,
      endTime: updatedBidding.endTime,
      bidCount: updatedBidding.bids.length,
    });

    // Record the bid in Postgres for backup
    await prisma.bid.create({
      data: {
        contractId: updatedBidding.contractId,
        teamSeasonId: teamSeason.id,
        amount,
      },
    });

    return NextResponse.json({
      success: true,
      bidding: updatedBidding,
    });
  } catch (error: any) {
    console.error('Error placing bid:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to place bid',
      },
      {
        status: error.message.includes('higher than current bid') ? 400 : 500,
      }
    );
  }
}

// PATCH /api/bidding/manage
// Admin endpoint to manage bidding (start, stop, finalize)
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(AuthOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, leagueId } = body;

    if (!action || !leagueId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    switch (action) {
      case 'start': {
        const now = Date.now();
        const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

        // Map league ID to tier level
        const tierLevels: Record<string, number> = {
          nhl: 1,
          ahl: 2,
          echl: 3,
          chl: 4,
        };

        await biddingUtils.setLeagueBiddingStatus(leagueId, {
          active: true,
          startTime: now,
          endTime: now + twoDaysMs,
          tierLevel: tierLevels[leagueId] || 0,
        });

        return NextResponse.json({
          success: true,
          message: `Bidding started for ${leagueId.toUpperCase()}`,
        });
      }

      case 'stop': {
        await biddingUtils.setLeagueBiddingStatus(leagueId, {
          active: false,
          startTime: 0,
          endTime: 0,
          tierLevel: 0,
        });

        return NextResponse.json({
          success: true,
          message: `Bidding stopped for ${leagueId.toUpperCase()}`,
        });
      }

      case 'finalize': {
        // Get all players in bidding for this league
        const tier = await prisma.tier.findFirst({
          where: {
            name: leagueId.toUpperCase(),
            season: {
              isLatest: true,
            },
          },
        });

        if (!tier) {
          return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
        }

        console.log(`Finalizing bidding for league ${leagueId}, tier ${tier.id}`);
        const biddingPlayers = await biddingUtils.getPlayersByTier(tier.id);
        console.log(`Found ${biddingPlayers.length} players in bidding`);

        // Process each player and assign to the winning team
        let successCount = 0;
        for (const player of biddingPlayers) {
          if (player.status === 'active') {
            console.log(`Processing player: ${player.playerName} (ID: ${player.id})`);
            console.log(`Current bid: ${player.currentBid}, team: ${player.currentTeamId}`);

            // Finalize the bidding in Redis
            const finalizedPlayer = await biddingUtils.finalizeBidding(player.id);

            // If there is a winning team, assign the player
            if (player.currentTeamId) {
              const teamSeason = await prisma.teamSeason.findFirst({
                where: {
                  teamId: player.currentTeamId,
                  tierId: tier.id,
                },
              });

              if (teamSeason) {
                console.log(
                  `Assigning player ${player.playerName} to team season ${teamSeason.id}`
                );

                // Create player-team association
                await prisma.playerTeamSeason.create({
                  data: {
                    playerSeasonId: player.id,
                    teamSeasonId: teamSeason.id,
                  },
                });

                // Update contract with the finalized bid amount
                console.log(
                  `Updating contract ${player.contractId} amount to ${player.currentBid}`
                );
                await prisma.contract.update({
                  where: { id: player.contractId },
                  data: {
                    amount: player.currentBid,
                    updatedAt: new Date(),
                  },
                });

                successCount++;
              } else {
                console.error(
                  `Team season not found for team ${player.currentTeamId} in tier ${tier.id}`
                );
              }
            } else {
              console.log(`No winning team for player ${player.playerName}`);
            }

            // Mark player as no longer in bidding
            await prisma.playerSeason.update({
              where: { id: player.id },
              data: { isInBidding: false },
            });
          }
        }

        // Stop bidding for this league
        await biddingUtils.setLeagueBiddingStatus(leagueId, {
          active: false,
          startTime: 0,
          endTime: 0,
          tierLevel: 0,
        });

        return NextResponse.json({
          success: true,
          message: `Bidding finalized for ${leagueId.toUpperCase()}`,
          processedPlayers: biddingPlayers.length,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing bidding:', error);
    return NextResponse.json({ error: 'Failed to manage bidding' }, { status: 500 });
  }
}
