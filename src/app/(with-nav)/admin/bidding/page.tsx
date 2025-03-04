'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, PlayCircle, TimerOff, XCircle, Database, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';

interface BiddingStatus {
  active: boolean;
  startTime: number;
  endTime: number;
  leagueId: string;
  tierLevel: number;
  lastUpdate: number;
}

export default function AdminBiddingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [biddingStatuses, setBiddingStatuses] = useState<Record<string, BiddingStatus | null>>({});
  const [activeBidding, setActiveBidding] = useState<BiddingStatus | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);
  const [testPlayerCount, setTestPlayerCount] = useState(5);
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);
  const [isInitializingBidding, setIsInitializingBidding] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoadingDebug, setIsLoadingDebug] = useState(false);
  const [dataStatus, setDataStatus] = useState<any>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('nhl');

  // Fetch initial data
  useEffect(() => {
    fetchBiddingStatus();
    checkBiddingDataStatus();
  }, []);

  // Debug session - only used for troubleshooting, not functionality
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  // Fetch bidding status
  const fetchBiddingStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/bidding', {
        credentials: 'include' // Ensure cookies are sent with the request
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bidding status');
      }
      
      const data = await response.json();
      setBiddingStatuses(data.biddingStatus || {});
      setActiveBidding(data.activeBidding);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching bidding status:', error);
      toast.error('Failed to load bidding status. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if session is loaded, to ensure cookies are ready
    if (status !== 'loading') {
      fetchBiddingStatus();
    }
  }, [status]);

  // Timer for periodic refresh
  useEffect(() => {
    if (status === 'loading') return;
    
    const interval = setInterval(() => {
      fetchBiddingStatus();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [status]);

  // Handle bidding actions
  const handleBiddingAction = async (action: 'start' | 'stop' | 'finalize', leagueId: string) => {
    if (isActionPending) return;
    
    try {
      setIsActionPending(true);
      
      const response = await fetch('/api/admin/bidding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent with the request
        body: JSON.stringify({
          action,
          leagueId,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('You are not authorized to perform this action. Please log in as an admin.');
          return;
        }
        throw new Error(result.error || 'Failed to perform action');
      }
      
      toast.success(result.message || 'Action completed successfully');
      
      // Refresh bidding status
      fetchBiddingStatus();
    } catch (error: any) {
      console.error('Error performing bidding action:', error);
      toast.error(error.message || 'Failed to perform action');
    } finally {
      setIsActionPending(false);
    }
  };

  // Create test player data
  const handleCreateTestData = async (leagueId: string) => {
    if (isCreatingTestData) return;
    
    try {
      setIsCreatingTestData(true);
      
      const response = await fetch(`/api/bidding/initialize?leagueId=${leagueId}&count=${testPlayerCount}`, {
        credentials: 'include' // Ensure cookies are sent with the request
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('You are not authorized to create test data. Please log in as an admin.');
          return;
        }
        throw new Error(result.error || 'Failed to create test data');
      }
      
      toast.success(result.message || 'Test players created successfully');
      fetchDebugData(leagueId);
    } catch (error: any) {
      console.error('Error creating test data:', error);
      toast.error(error.message || 'Failed to create test data');
    } finally {
      setIsCreatingTestData(false);
    }
  };

  // Initialize players in Redis
  const handleInitializeBidding = async (leagueId: string) => {
    if (isInitializingBidding) return;
    
    try {
      setIsInitializingBidding(true);
      
      const response = await fetch('/api/bidding/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent with the request
        body: JSON.stringify({
          leagueId,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('You are not authorized to initialize bidding. Please log in as an admin.');
          return;
        }
        throw new Error(result.error || 'Failed to initialize bidding');
      }
      
      if (result.initializedCount === 0) {
        toast.info(result.message || 'No players to initialize');
      } else {
        toast.success(result.message || 'Players initialized successfully');
      }
      
      // Refresh data
      fetchBiddingStatus();
    } catch (error: any) {
      console.error('Error initializing bidding:', error);
      toast.error(error.message || 'Failed to initialize bidding');
    } finally {
      setIsInitializingBidding(false);
    }
  };

  // Fetch debug data
  const fetchDebugData = async (leagueId: string) => {
    try {
      setIsLoadingDebug(true);
      
      const response = await fetch(`/api/bidding/debug?leagueId=${leagueId}`, {
        credentials: 'include' // Ensure cookies are sent with the request
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch debug data');
      }
      
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Error fetching debug data:', error);
      toast.error('Failed to fetch debug data');
    } finally {
      setIsLoadingDebug(false);
    }
  };

  // Format dates
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate time remaining
  const calculateTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const diff = endTime - now;
    
    if (diff <= 0) {
      return 'Ending...';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  // Add a new function to fix bidding data
  const fixBiddingData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/bidding/fix-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leagueId: selectedLeagueId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fix bidding data');
      }
      
      const data = await response.json();
      toast.success(`Fixed bidding data: ${data.message}`);
      
      // Fetch the status to display updated stats
      await checkBiddingDataStatus();
      // Also refresh regular bidding status
      await fetchBiddingStatus();
    } catch (error) {
      console.error('Error fixing bidding data:', error);
      toast.error('Failed to fix bidding data');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to check the status of bidding data
  const checkBiddingDataStatus = async () => {
    try {
      const dataResponse = await fetch(`/api/bidding/fix-data?leagueId=${selectedLeagueId}`);
      
      if (dataResponse.ok) {
        const dataStatus = await dataResponse.json();
        setDataStatus({
          playerCount: dataStatus.playerCount,
          playersWithGamertag: dataStatus.playersWithGamertag,
          playersWithEndTime: dataStatus.playersWithEndTime,
          playersWithActiveBids: dataStatus.playersWithActiveBids,
        });
      }
    } catch (error) {
      console.error('Error checking data status:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Bidding Administration</CardTitle>
            <CardDescription>Loading bidding status...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You must be logged in as an admin to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/sign-in')}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bidding Administration</CardTitle>
          <CardDescription>
            Manage bidding periods for leagues. Only one league can be active at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeBidding ? (
            <Alert className="mb-6 bg-green-900/20 border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-400">Bidding Active</AlertTitle>
              <AlertDescription>
                {activeBidding.leagueId.toUpperCase()} bidding is currently active.
                Ends at {formatDate(activeBidding.endTime)}.
                {" "}
                <span className="font-semibold">
                  {calculateTimeRemaining(activeBidding.endTime)}
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6 bg-yellow-900/20 border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertTitle className="text-yellow-400">No Active Bidding</AlertTitle>
              <AlertDescription>
                There is no active bidding period. Start bidding for a league below.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="nhl">
            <TabsList className="mb-6 w-full grid grid-cols-4">
              <TabsTrigger value="nhl">NHL</TabsTrigger>
              <TabsTrigger value="ahl">AHL</TabsTrigger>
              <TabsTrigger value="echl">ECHL</TabsTrigger>
              <TabsTrigger value="chl">CHL</TabsTrigger>
            </TabsList>

            {['nhl', 'ahl', 'echl', 'chl'].map((leagueId) => (
              <TabsContent key={leagueId} value={leagueId} className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <h3 className="text-xl font-semibold">{leagueId.toUpperCase()} Bidding</h3>
                    <div className="flex items-center mt-2">
                      <Badge 
                        variant="outline" 
                        className={
                          biddingStatuses[leagueId]?.active 
                            ? "bg-green-900/20 text-green-400 border-green-700"
                            : "bg-gray-800 text-gray-400 border-gray-700"
                        }
                      >
                        {biddingStatuses[leagueId]?.active ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      {biddingStatuses[leagueId]?.active && (
                        <div className="ml-4 flex items-center text-sm text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {calculateTimeRemaining(biddingStatuses[leagueId]?.endTime || 0)}
                        </div>
                      )}
                    </div>
                    
                    {biddingStatuses[leagueId]?.active && (
                      <div className="mt-2 text-sm text-gray-400">
                        <div>Started: {formatDate(biddingStatuses[leagueId]?.startTime || 0)}</div>
                        <div>Ends: {formatDate(biddingStatuses[leagueId]?.endTime || 0)}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {!biddingStatuses[leagueId]?.active && !activeBidding && (
                      <Button
                        onClick={() => handleBiddingAction('start', leagueId)}
                        disabled={isActionPending}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Bidding
                      </Button>
                    )}
                    
                    {biddingStatuses[leagueId]?.active && (
                      <>
                        <Button
                          variant="destructive"
                          onClick={() => handleBiddingAction('stop', leagueId)}
                          disabled={isActionPending}
                        >
                          <TimerOff className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleBiddingAction('finalize', leagueId)}
                          disabled={isActionPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Finalize
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
                  <h4 className="text-lg font-semibold">Development Tools</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchDebugData(leagueId)}
                        disabled={isLoadingDebug}
                        className="mr-2"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDebug ? 'animate-spin' : ''}`} />
                        Debug Data
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleInitializeBidding(leagueId)}
                        disabled={isInitializingBidding}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {isInitializingBidding ? 'Initializing...' : 'Initialize Players in Redis'}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2 mr-4">
                        <span className="text-sm">Test Players:</span>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={testPlayerCount}
                          onChange={(e) => setTestPlayerCount(parseInt(e.target.value) || 5)}
                          className="w-16 h-8 text-center"
                        />
                      </div>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCreateTestData(leagueId)}
                        disabled={isCreatingTestData}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {isCreatingTestData ? 'Creating...' : 'Create Test Players'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {debugData && debugData.tier?.name === leagueId.toUpperCase() && (
                  <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
                    <h4 className="text-lg font-semibold">Debug Information</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Season</h5>
                        <div className="text-xs text-gray-400">
                          <div>ID: {debugData.season.id}</div>
                          <div>Season ID: {debugData.season.seasonId}</div>
                          <div>Is Latest: {debugData.season.isLatest ? 'Yes' : 'No'}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Tier</h5>
                        <div className="text-xs text-gray-400">
                          <div>ID: {debugData.tier.id}</div>
                          <div>Name: {debugData.tier.name}</div>
                          <div>Level: {debugData.tier.leagueLevel}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Player Counts</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-900/50 p-2 rounded">
                          <div className="text-xs font-medium">All Players</div>
                          <div className="text-xl font-mono">{debugData.counts.allPlayerSeasons}</div>
                        </div>
                        <div className="bg-gray-900/50 p-2 rounded">
                          <div className="text-xs font-medium">In Bidding</div>
                          <div className="text-xl font-mono">{debugData.counts.inBidding}</div>
                        </div>
                        <div className="bg-gray-900/50 p-2 rounded">
                          <div className="text-xs font-medium">Not On Team</div>
                          <div className="text-xl font-mono">{debugData.counts.notOnTeam}</div>
                        </div>
                        <div className="bg-gray-900/50 p-2 rounded">
                          <div className="text-xs font-medium">Available for Bidding</div>
                          <div className="text-xl font-mono text-green-400">{debugData.counts.availablePlayers}</div>
                        </div>
                      </div>
                    </div>
                    
                    {debugData.samplePlayers && debugData.samplePlayers.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Sample Players</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {debugData.samplePlayers.map((player: any, index: number) => (
                            <div key={index} className="bg-gray-900/50 p-2 rounded flex justify-between">
                              <div>
                                <div className="text-xs font-medium">{player.playerName}</div>
                                <div className="text-xs text-gray-400">Position: {player.position}</div>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={player.isInBidding 
                                  ? "bg-green-900/20 text-green-400 border-green-700" 
                                  : "bg-gray-800 text-gray-400 border-gray-700"}
                              >
                                {player.isInBidding ? 'In Bidding' : 'Not in Bidding'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-lg font-semibold mb-2">Bidding Schedule</h4>
                  <p className="text-gray-400">
                    Bidding order: NHL → AHL → ECHL → CHL
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-400">
                    <li>Each bidding period lasts 2 days</li>
                    <li>The next league's bidding starts at 8 PM EST after the previous one ends</li>
                    <li>Bid timers start at 8 hours</li>
                    <li>Once below 6 hours, new bids reset the timer to 6 hours</li>
                  </ul>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Add a Fix Bidding Data section */}
          <div className="card-gradient rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Fix Bidding Data</h2>
            <p className="mb-4">
              This will update player data in Redis to fix gamertags and endTime issues:
            </p>
            
            {dataStatus && (
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <h3 className="font-semibold mb-1">Current Data Status:</h3>
                <ul>
                  <li>Total Players: {dataStatus.playerCount}</li>
                  <li>Players with Gamertag: {dataStatus.playersWithGamertag} / {dataStatus.playerCount}</li>
                  <li>Players with EndTime: {dataStatus.playersWithEndTime} / {dataStatus.playerCount}</li>
                  <li>Players with Active Bids: {dataStatus.playersWithActiveBids} / {dataStatus.playerCount}</li>
                </ul>
              </div>
            )}
            
            <button
              onClick={fixBiddingData}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Processing...' : 'Fix Bidding Data'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 