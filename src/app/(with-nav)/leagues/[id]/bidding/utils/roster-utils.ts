/**
 * Counts the number of players in specified positions
 * @param roster - The team roster
 * @param positions - Array of positions to count
 * @returns The number of players in the specified positions
 */
export function getPositionCount(roster: any[], positions: string[]): number {
    return roster.filter((player) => positions.includes(player.position)).length;
  }
  
  /**
   * Filters and returns players in a specific position
   * @param roster - The team roster
   * @param position - The position to filter by
   * @returns Array of players in the specified position
   */
  export function getPositionPlayers(roster: any[], position: string): any[] {
    return roster.filter((player) => player.position === position);
  }