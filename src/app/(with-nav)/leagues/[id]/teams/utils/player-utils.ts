import { TeamSeasonPlayer } from '../types/team-season-player';

/**
 * Filters and sorts players by position
 * @param {TeamSeasonPlayer[]} players - Array of players to filter
 * @param {string[]} positions - Array of positions to filter by
 * @returns {TeamSeasonPlayer[]} Filtered and sorted players
 */
function getPositionPlayers(players: TeamSeasonPlayer[], positions: string[]): TeamSeasonPlayer[] {
    return players
        .filter((p) => positions.includes(p.playerSeason.position))
        .sort((a, b) => a.playerSeason.player.name.localeCompare(b.playerSeason.player.name));
}

export { getPositionPlayers };