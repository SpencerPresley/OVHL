import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

// Namespaces for Redis keys to avoid collisions
const keyPrefix = {
  bidding: 'ovhl:bidding:',
  timerControl: 'ovhl:bidding:timer:',
  leagueStatus: 'ovhl:bidding:league:',
};

/**
 * Create a Redis key with the appropriate namespace
 */
const createKey = (namespace: string, id: string) =>
  `${keyPrefix[namespace as keyof typeof keyPrefix]}${id}`;

/**
 * Bidding system utilities
 */
export const biddingUtils = {
  /**
   * Initialize a player for bidding
   */
  async setPlayerBidding(
    playerSeasonId: string,
    initialData: {
      startingAmount: number;
      tierId: string;
      tierName: string;
      endTime?: number;
      playerName: string;
      position: string;
      contractId: string;
      gamertag?: string;
      stats?: {
        gamesPlayed: number;
        goals: number;
        assists: number;
        plusMinus: number;
      };
    }
  ) {
    const key = createKey('bidding', playerSeasonId);

    // Only set endTime if this player already has bids
    // Otherwise, endTime will be set when the first bid is placed
    const hasInitialBid = initialData.startingAmount > 0 && initialData.endTime;

    const data = {
      ...initialData,
      id: playerSeasonId, // Include the ID for easier reference
      currentBid: null, // Start with no bids
      currentTeamId: null,
      currentTeamName: null,
      contract: {
        id: initialData.contractId,
        amount: initialData.startingAmount, // Ensure contract has an amount property
      },
      // Only include endTime if there's an initial bid
      ...(hasInitialBid ? { endTime: initialData.endTime } : {}),
      // Include gamertag if provided
      ...(initialData.gamertag ? { gamertag: initialData.gamertag } : {}),
      // Include stats object with default values if not provided
      stats: initialData.stats || {
        gamesPlayed: 0,
        goals: 0,
        assists: 0,
        plusMinus: 0,
      },
      bids: [],
      status: 'active',
      lastUpdate: Date.now(),
    };

    await redis.set(key, JSON.stringify(data));
    return data;
  },

  /**
   * Get bidding data for a player
   */
  async getPlayerBidding(playerSeasonId: string) {
    const key = createKey('bidding', playerSeasonId);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Place a bid on a player
   */
  async placeBid(
    playerSeasonId: string,
    bidData: {
      teamId: string;
      teamName: string;
      amount: number;
      teamSeasonId: string;
    }
  ) {
    const key = createKey('bidding', playerSeasonId);
    const data = await redis.get(key);

    if (!data) {
      throw new Error('Player not found in bidding');
    }

    const playerData = JSON.parse(data);

    // Validate bid amount
    const INCREMENT = 250000; // 250k increment

    if (playerData.currentBid === null) {
      // First bid must be at least the starting amount (contract amount)
      if (bidData.amount < playerData.startingAmount) {
        throw new Error(
          `First bid must be at least $${playerData.startingAmount.toLocaleString()} (the contract amount)`
        );
      }
      
      // Check if bid is in valid increments of 250k
      if (bidData.amount % INCREMENT !== 0) {
        throw new Error(`Bids must be in increments of $${INCREMENT.toLocaleString()}`);
      }
    } else {
      // Subsequent bids must be at least 250k more than current
      const minBid = playerData.currentBid + INCREMENT;

      if (bidData.amount < minBid) {
        throw new Error(
          `Bid must be at least $${minBid.toLocaleString()} (current bid + $${INCREMENT.toLocaleString()})`
        );
      }

      // Check if bid is in valid increments of 250k
      if (bidData.amount % INCREMENT !== 0) {
        throw new Error(`Bids must be in increments of $${INCREMENT.toLocaleString()}`);
      }
    }

    // Calculate new end time based on time remaining
    const now = Date.now();
    let newEndTime;

    // If this is the first bid, set endTime to 8 hours from now
    if (!playerData.currentTeamId) {
      newEndTime = now + 8 * 60 * 60 * 1000; // 8 hours
    } else {
      // Check remaining time
      const remainingTime = playerData.endTime - now;

      // If < 6 hours remain, extend by 6 hours
      if (remainingTime < 6 * 60 * 60 * 1000) {
        newEndTime = now + 6 * 60 * 60 * 1000; // 6 hours
      } else {
        // Keep existing end time
        newEndTime = playerData.endTime;
      }
    }

    // Add the new bid to the history
    const newBid = {
      teamId: bidData.teamId,
      teamName: bidData.teamName,
      amount: bidData.amount,
      timestamp: now,
    };

    // Update player data
    const updatedPlayerData = {
      ...playerData,
      currentBid: bidData.amount,
      currentTeamId: bidData.teamId,
      currentTeamName: bidData.teamName,
      endTime: newEndTime,
      bids: [...playerData.bids, newBid],
      lastUpdate: now,
      status: 'active',
    };

    // Save updated player data
    await redis.set(key, JSON.stringify(updatedPlayerData));

    return updatedPlayerData;
  },

  /**
   * Get all active player bids
   */
  async getActivePlayerBids() {
    // Get all keys in the bidding namespace
    const keys = await redis.keys(`${keyPrefix.bidding}*`);

    // Filter to only include active bids
    const activeBids = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const player = JSON.parse(data);
        if (player.status === 'active') {
          activeBids.push(key);
        }
      }
    }

    return activeBids;
  },

  /**
   * Get all players in bidding for a specific tier
   */
  async getPlayersByTier(tierId: string) {
    // Get all keys in the bidding namespace
    const keys = await redis.keys(`${keyPrefix.bidding}*`);
    const playerData = [];

    // Fetch all player data and filter by tier
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const player = JSON.parse(data);
        if (player.tierId === tierId) {
          // Ensure player has a stats object
          if (!player.stats) {
            player.stats = {
              gamesPlayed: 0,
              goals: 0,
              assists: 0,
              plusMinus: 0,
            };
          }
          playerData.push(player);
        }
      }
    }

    return playerData;
  },

  /**
   * Finalize a player's bidding and return the result
   */
  async finalizeBidding(playerSeasonId: string) {
    const key = createKey('bidding', playerSeasonId);
    const data = await redis.get(key);

    if (!data) {
      throw new Error('Player not found in bidding');
    }

    const playerData = JSON.parse(data);

    // Update status to completed
    const finalizedData = {
      ...playerData,
      status: 'completed',
      finalizedAt: Date.now(),
      // Set contract amount directly
      contract: {
        ...playerData.contract,
        amount: playerData.currentBid,
      },
      // Ensure stats object is preserved
      stats: playerData.stats || {
        gamesPlayed: 0,
        goals: 0,
        assists: 0,
        plusMinus: 0,
      },
    };

    // Save updated data
    await redis.set(key, JSON.stringify(finalizedData));

    return finalizedData;
  },

  /**
   * Get the status of a league's bidding period
   */
  async getLeagueBiddingStatus(leagueId: string) {
    const key = createKey('leagueStatus', leagueId);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Set the status and timing for a league's bidding period
   */
  async setLeagueBiddingStatus(
    leagueId: string,
    status: {
      active: boolean;
      startTime: number;
      endTime: number;
      tierLevel: number;
    }
  ) {
    const key = createKey('leagueStatus', leagueId);
    await redis.set(
      key,
      JSON.stringify({
        ...status,
        leagueId,
        lastUpdate: Date.now(),
      })
    );
  },

  /**
   * Get the current active league in bidding
   */
  async getCurrentActiveBidding() {
    const leagueIds = ['nhl', 'ahl', 'echl', 'chl'];

    for (const leagueId of leagueIds) {
      const status = await biddingUtils.getLeagueBiddingStatus(leagueId);
      if (status && status.active) {
        return status;
      }
    }

    return null;
  },

  /**
   * Get total committed bids for a team
   */
  async getTeamCommittedBids(teamId: string) {
    // Get all keys in the bidding namespace
    const keys = await redis.keys(`${keyPrefix.bidding}*`);
    let totalCommitted = 0;
    const activeBids = [];
    
    console.log(`Checking ${keys.length} keys for team ${teamId} active bids`);

    // Calculate total committed amount from current bids
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        try {
          const player = JSON.parse(data);
          const playerIdFromKey = key.replace(keyPrefix.bidding, '');
          
          // Debug player data to see what we're working with
          console.log(`Player ${player.playerName} (${playerIdFromKey}): currentTeamId=${player.currentTeamId}, status=${player.status}, currentBid=${player.currentBid}`);
          
          // Only count active bids where this team is the current highest bidder
          // Make sure we have a currentTeamId that matches AND a status of 'active'
          // Also ensure currentBid exists (not null)
          if (player.currentTeamId === teamId && player.status === 'active' && player.currentBid !== null) {
            // Ensure currentBid is a number
            const bidAmount = Number(player.currentBid);
            if (!isNaN(bidAmount)) {
              totalCommitted += bidAmount;

              activeBids.push({
                playerSeasonId: playerIdFromKey,
                playerName: player.playerName,
                position: player.position,
                amount: bidAmount,
                endTime: player.endTime,
              });
              console.log(`Added active bid for ${player.playerName}: $${bidAmount}`);
            } else {
              console.error(
                `Invalid bid amount for player ${player.playerName}: ${player.currentBid}`
              );
            }
          }
        } catch (err) {
          console.error(`Error processing bid data for key ${key}:`, err);
        }
      }
    }

    console.log(`Team ${teamId} total committed: ${totalCommitted}, active bids: ${activeBids.length}`);
    return { totalCommitted, activeBids };
  },

  /**
   * Debug/Test function to toggle bidding on a league
   */
  async toggleBidding(leagueId: string, active: boolean) {
    const key = createKey('leagueStatus', leagueId);
    const now = Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

    // Map league ID to tier level
    const tierLevels = {
      nhl: 1,
      ahl: 2,
      echl: 3,
      chl: 4,
    };

    await redis.set(
      key,
      JSON.stringify({
        active,
        leagueId,
        startTime: now,
        endTime: now + twoDaysMs,
        tierLevel: tierLevels[leagueId as keyof typeof tierLevels] || 0,
        lastUpdate: now,
      })
    );
  },
};

export default redis;
