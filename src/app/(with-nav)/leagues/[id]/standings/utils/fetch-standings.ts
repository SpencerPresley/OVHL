// utils/fetch-standings.ts
import { DivisionStandings } from '../types';

export async function fetchStandings(leagueId: string): Promise<DivisionStandings[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/leagues/${leagueId}/standings`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch standings: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.standings;
  } catch (error) {
    console.error('Error fetching standings:', error);
    return [];
  }
}