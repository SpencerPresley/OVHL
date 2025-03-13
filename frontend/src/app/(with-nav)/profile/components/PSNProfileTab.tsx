'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import Image from 'next/image';
import { Gamepad2, Trophy, Calendar, Clock, Users, Crown } from 'lucide-react';

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

interface PSNProfileData {
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

export function PSNProfileTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<PSNProfileData | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchPSNProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/psn/profile');
        
        if (!response.ok) {
          throw new Error('Server error when fetching PSN profile');
        }
        
        const data = await response.json();
        
        // Check if the response indicates the profile is not verified/doesn't exist
        if (data.verified === false) {
          setNeedsVerification(true);
          setError(data.message || 'PSN profile not found. Please connect your account in the Integrations tab.');
        } else {
          setProfileData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PSN profile');
        console.error('Error fetching PSN profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPSNProfile();
  }, []);

  if (loading) {
    return <PSNProfileSkeleton />;
  }

  if (error || !profileData) {
    return (
      <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            PlayStation Network Profile
          </CardTitle>
          <CardDescription className="text-gray-300">
            {error || 'No PSN profile found. Connect your PSN account in the Integrations tab.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {needsVerification && (
            <div className="p-4 border border-blue-600 bg-blue-950/30 rounded-md">
              <p className="flex items-center">
                <span className="mr-2 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </span>
                <span>
                  To display your PSN profile data, you need to connect your PlayStation Network account.
                </span>
              </p>
              <div className="mt-4">
                <button 
                  onClick={() => {
                    const element = document.querySelector('button[value="integrations"]');
                    if (element) {
                      (element as HTMLButtonElement).click();
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
                >
                  Go to Integrations Tab
                </button>
              </div>
            </div>
          )}
        </CardContent>
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
  const largeAvatar = profileData.avatars?.find(a => a.size === 'xl') || 
                      profileData.avatars?.find(a => a.size === 'l') || 
                      profileData.avatars?.[0];

  // Sort games by last played
  const sortedGames = [...profileData.games].sort((a, b) => {
    if (!a.lastPlayed) return 1;
    if (!b.lastPlayed) return -1;
    return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
  });

  // Get recent games (last 5)
  const recentGames = sortedGames.slice(0, 5);

  // Get most played games (top 5 by playtime)
  const mostPlayedGames = [...profileData.games]
    .sort((a, b) => (b.playTimeMinutes || 0) - (a.playTimeMinutes || 0))
    .slice(0, 5);

  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          PlayStation Network Profile
        </CardTitle>
        <CardDescription className="text-gray-300">
          View your PSN profile, games, and trophies
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Profile Overview */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-shrink-0">
            {largeAvatar && (
              <Image 
                src={largeAvatar.url} 
                alt={`${profileData.onlineId} avatar`} 
                width={80} 
                height={80}
                className="rounded-lg border-2 border-blue-500"
              />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {profileData.onlineId}
              {profileData.isPlus && (
                <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">PS+</span>
              )}
            </h3>
            
            {profileData.aboutMe && (
              <p className="text-sm text-gray-300">{profileData.aboutMe}</p>
            )}
            
            <div className="flex gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{profileData.friendsCount || 0} friends</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Last sync: {formatDate(profileData.lastProfileSync)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trophy Summary */}
        {profileData.trophy && (
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Trophy Level: {profileData.trophy.trophyLevel}
              <div className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                {profileData.trophy.progress || 0}% to next level
              </div>
            </h3>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-yellow-400 font-semibold">{profileData.trophy.platinumCount || 0}</div>
                <div className="text-xs text-gray-400">Platinum</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-yellow-200 font-semibold">{profileData.trophy.goldCount || 0}</div>
                <div className="text-xs text-gray-400">Gold</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-300 font-semibold">{profileData.trophy.silverCount || 0}</div>
                <div className="text-xs text-gray-400">Silver</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-amber-700 font-semibold">{profileData.trophy.bronzeCount || 0}</div>
                <div className="text-xs text-gray-400">Bronze</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="recent">Recent Games</TabsTrigger>
            <TabsTrigger value="mostplayed">Most Played</TabsTrigger>
            <TabsTrigger value="all">All Games</TabsTrigger>
          </TabsList>
          
          {/* Recent Games Tab */}
          <TabsContent value="recent" className="pt-4">
            <GameList games={recentGames} formatPlaytime={formatPlaytime} formatDate={formatDate} />
          </TabsContent>
          
          {/* Most Played Games Tab */}
          <TabsContent value="mostplayed" className="pt-4">
            <GameList games={mostPlayedGames} formatPlaytime={formatPlaytime} formatDate={formatDate} />
          </TabsContent>
          
          {/* All Games Tab */}
          <TabsContent value="all" className="pt-4">
            <div className="text-sm text-gray-400 mb-3">
              Showing {profileData.games.length} games
            </div>
            <GameList games={sortedGames} formatPlaytime={formatPlaytime} formatDate={formatDate} />
          </TabsContent>
        </Tabs>
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
    return <div className="text-center py-10 text-gray-400">No games found</div>;
  }
  
  return (
    <div className="space-y-4">
      {games.map((game) => (
        <div key={game.id} className="flex gap-4 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors">
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
              {game.playCount !== null && game.playCount > 0 && (
                <div>
                  Played {game.playCount} times
                </div>
              )}
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

// Skeleton loader for PSN Profile
function PSNProfileSkeleton() {
  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          PlayStation Network Profile
        </CardTitle>
        <CardDescription className="text-gray-300">
          Loading your PSN profile...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <Skeleton className="w-20 h-20 rounded-lg bg-gray-700" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40 bg-gray-700" />
            <Skeleton className="h-4 w-full bg-gray-700" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-4 w-32 bg-gray-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
          <Skeleton className="h-6 w-40 bg-gray-700 mb-3" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-16 bg-gray-700 rounded-lg" />
            <Skeleton className="h-16 bg-gray-700 rounded-lg" />
            <Skeleton className="h-16 bg-gray-700 rounded-lg" />
            <Skeleton className="h-16 bg-gray-700 rounded-lg" />
          </div>
        </div>
        
        <Skeleton className="h-10 w-full bg-gray-700 rounded-lg mb-4" />
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-16 h-16 bg-gray-700 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 bg-gray-700 mb-2" />
                <Skeleton className="h-3 w-full bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 