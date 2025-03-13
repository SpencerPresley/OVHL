'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Gamepad2, Trophy, Calendar, Clock, Users } from 'lucide-react';

// This interface represents the trophy data
interface TrophyData {
  trophyLevel: number | null;
  progress: number | null;
  tier: number | null;
  platinumCount: number | null;
  goldCount: number | null;
  silverCount: number | null;
  bronzeCount: number | null;
  totalTrophies: number | null;
}

// This interface represents a game from the PSN profile
interface Game {
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

// This interface represents the full PSN profile
interface PSNProfileData {
  id: string;
  onlineId: string;
  accountId: string | null;
  aboutMe: string | null;
  languages: string[];
  isPlus: boolean;
  isOfficiallyVerified: boolean | null;
  friendsCount: number | null;
  avatars: { size: string; url: string }[];
  trophy: TrophyData | null;
  games: Game[];
  lastProfileSync: string | null;
}

interface PSNProfilePublicViewProps {
  profile: PSNProfileData | null;
}

export function PSNProfilePublicView({ profile }: PSNProfilePublicViewProps) {
  if (!profile) {
    return (
      <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            PlayStation Network
          </CardTitle>
          <CardDescription className="text-gray-300">
            This user has not connected their PSN account.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Format playtime from minutes to hours and days
  const formatPlaytime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    result += `${mins}m`;
    
    return result;
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get large avatar URL
  const largeAvatar = profile.avatars?.find(a => a.size === 'xl') || 
                      profile.avatars?.find(a => a.size === 'l') || 
                      profile.avatars?.[0];

  // Sort games by last played
  const recentGames = [...profile.games]
    .sort((a, b) => {
      if (!a.lastPlayed) return 1;
      if (!b.lastPlayed) return -1;
      return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
    })
    .slice(0, 5);

  // Get most played games (top 5 by playtime)
  const mostPlayedGames = [...profile.games]
    .sort((a, b) => (b.playTimeMinutes || 0) - (a.playTimeMinutes || 0))
    .slice(0, 5);

  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          PlayStation Network Profile
        </CardTitle>
        <CardDescription className="text-gray-300">
          {profile.onlineId}
          {profile.isPlus && (
            <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">PS+</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Profile Overview */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-shrink-0">
            {largeAvatar && (
              <Image 
                src={largeAvatar.url} 
                alt={`${profile.onlineId} avatar`} 
                width={80} 
                height={80}
                className="rounded-lg border-2 border-blue-500"
              />
            )}
          </div>

          <div className="space-y-2">
            {profile.aboutMe && (
              <p className="text-sm text-gray-300">{profile.aboutMe}</p>
            )}
            
            <div className="flex gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{profile.friendsCount || 0} friends</span>
              </div>
              {profile.lastProfileSync && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Last synced: {formatDate(profile.lastProfileSync)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trophy Summary */}
        {profile.trophy && (
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Trophy Level: {profile.trophy.trophyLevel}
              <div className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                {profile.trophy.progress || 0}% to next level
              </div>
            </h3>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-yellow-400 font-semibold">{profile.trophy.platinumCount || 0}</div>
                <div className="text-xs text-gray-400">Platinum</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-yellow-200 font-semibold">{profile.trophy.goldCount || 0}</div>
                <div className="text-xs text-gray-400">Gold</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-300 font-semibold">{profile.trophy.silverCount || 0}</div>
                <div className="text-xs text-gray-400">Silver</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-amber-700 font-semibold">{profile.trophy.bronzeCount || 0}</div>
                <div className="text-xs text-gray-400">Bronze</div>
              </div>
            </div>
          </div>
        )}

        {/* Games */}
        {profile.games.length > 0 && (
          <div className="space-y-4">
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="recent">Recent Games</TabsTrigger>
                <TabsTrigger value="mostplayed">Most Played</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent" className="pt-4">
                <GameList games={recentGames} formatPlaytime={formatPlaytime} formatDate={formatDate} />
              </TabsContent>
              
              <TabsContent value="mostplayed" className="pt-4">
                <GameList games={mostPlayedGames} formatPlaytime={formatPlaytime} formatDate={formatDate} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for displaying games
function GameList({ 
  games, 
  formatPlaytime, 
  formatDate 
}: { 
  games: Game[],
  formatPlaytime: (minutes: number | null) => string,
  formatDate: (date: string | null) => string
}) {
  if (games.length === 0) {
    return <div className="text-center py-6 text-gray-400">No games found</div>;
  }
  
  return (
    <div className="space-y-4">
      {games.map((game) => (
        <div key={game.id} className="flex gap-4 p-3 bg-gray-800/40 rounded-lg">
          <div className="flex-shrink-0 w-16 h-16 relative">
            {game.imageUrl ? (
              <Image 
                src={game.imageUrl} 
                alt={game.name} 
                width={64} 
                height={64}
                className="rounded-md object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <h4 className="font-medium">{game.name}</h4>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatPlaytime(game.playTimeMinutes)}
              </div>
              <div>
                {getPlatformLabel(game.platform)}
              </div>
              {game.lastPlayed && (
                <div>
                  Last played: {formatDate(game.lastPlayed)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to get platform label
function getPlatformLabel(platform: string): string {
  switch (platform) {
    case 'ps5_native_game':
      return 'PS5';
    case 'ps4_game':
      return 'PS4';
    default:
      return platform.toUpperCase().replace('_', ' ');
  }
} 