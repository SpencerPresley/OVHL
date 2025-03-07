import { StatCategory } from '../types';

/**
 * Fetches statistics data for a specific league and category
 */
export async function fetchStats<T>(
  leagueId: string, 
  category: StatCategory
): Promise<T[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(
      `${apiUrl}/api/leagues/${leagueId}/stats?category=${category}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch ${category} stats: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.stats || [];
  } catch (error) {
    console.error(`Error fetching ${category} stats:`, error);
    return [];
  }
}