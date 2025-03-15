/**
 * Type definitions for PSN profile data
 */

// Trophy data interface
export interface TrophyData {
  trophyLevel: number | null;
  progress: number | null;
  tier: number | null;
  platinumCount: number | null;
  goldCount: number | null;
  silverCount: number | null;
  bronzeCount: number | null;
  totalTrophies: number | null;
}

// Game interface
export interface Game {
  id: string;
  name: string;
  platform: string;
  imageUrl: string | null;
  playCount: number | null;
  playTimeMinutes: number | null;
  firstPlayed: string | null;
  lastPlayed: string | null;
  playDuration: string | null;
}

// PSN Profile interface
export interface PSNProfileData {
  id: string;
  onlineId: string;
  accountId: string | null;
  aboutMe: string | null;
  languages: string[];
  isPlus: boolean;
  friendsCount: number | null;
  avatars: { size: string; url: string }[];
  trophy: TrophyData | null;
  games: Game[];
  lastProfileSync: string | null;
  lastGameSync: string | null;
}
