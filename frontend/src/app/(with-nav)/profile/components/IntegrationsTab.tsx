'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Gamepad2, Loader2 } from 'lucide-react';

type Platform = 'psn' | 'xbox';
type VerificationStatus = 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'FAILED';

interface PlatformIntegration {
  id: string;
  platform: Platform;
  username: string;
  verificationCode?: string;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  codeGeneratedAt?: string;
  codeExpiresAt?: string;
  verifiedAt?: string;
  updatedAt: string;
}

export function IntegrationsTab() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('psn');
  const [username, setUsername] = useState('');
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [currentStep, setCurrentStep] = useState<'select' | 'verify'>('select');
  const [verificationCode, setVerificationCode] = useState('');
  const [inputVerificationCode, setInputVerificationCode] = useState('');
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);
  const [activeTab, setActiveTab] = useState('add');

  // Fetch existing integrations when component mounts
  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setIsLoadingIntegrations(true);
    try {
      const response = await fetch('/api/integrations');
      if (!response.ok) {
        throw new Error('Failed to fetch integrations');
      }
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setIsLoadingIntegrations(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!username) {
      setError('Please enter your username');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/integrations/generateCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatform, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate verification code');
      }

      setVerificationCode(data.code);
      setShowCodeDialog(true);

      // Refresh integrations list
      await fetchIntegrations();
    } catch (error) {
      console.error('Error generating code:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!inputVerificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    console.log('Starting verification process for:', {
      platform: selectedPlatform,
      username: username,
      code: inputVerificationCode,
    });

    try {
      const verifyPayload = {
        platform: selectedPlatform,
        username,
        code: inputVerificationCode,
      };

      console.log('Sending verification request:', verifyPayload);

      const response = await fetch('/api/integrations/verifyCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyPayload),
      });

      console.log('Verification response status:', response.status);

      const data = await response.json();
      console.log('Verification response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      setSuccess(
        data.message ||
          `Your ${selectedPlatform.toUpperCase()} account has been successfully verified!`
      );
      setCurrentStep('select');
      setUsername('');
      setInputVerificationCode('');

      // Refresh integrations list
      await fetchIntegrations();
    } catch (error) {
      console.error('Error verifying code:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-900/20 text-green-400 border-green-800';
      case 'PENDING':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-800';
      case 'EXPIRED':
        return 'bg-red-900/20 text-red-400 border-red-800';
      case 'FAILED':
        return 'bg-red-900/20 text-red-400 border-red-800';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-800';
    }
  };

  const prepareForVerification = (integration: PlatformIntegration) => {
    setSelectedPlatform(integration.platform);
    setUsername(integration.username);
    setVerificationCode(integration.verificationCode || '');
    setInputVerificationCode(integration.verificationCode || '');
    setCurrentStep('verify');
    setActiveTab('add'); // Switch to the Add Integration tab where verification form is displayed

    // Clear any previous messages
    setError('');
    setSuccess('');

    console.log('Preparing for verification:', {
      platform: integration.platform,
      username: integration.username,
      code: integration.verificationCode,
    });
  };

  // Function to handle dialog close
  const handleDialogClose = () => {
    setShowCodeDialog(false);
    setActiveTab('manage'); // Switch to manage tab when dialog closes
  };

  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Gaming Platform Integrations
        </CardTitle>
        <CardDescription className="text-gray-300">
          Connect your gaming accounts to verify your identity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="add">Add Integration</TabsTrigger>
            <TabsTrigger value="manage">Manage Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-6 pt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-900/20 text-green-400 border-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {currentStep === 'select' ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="platform">Select Platform</Label>
                  <Select
                    value={selectedPlatform}
                    onValueChange={(value) => setSelectedPlatform(value as Platform)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psn">PlayStation Network (PSN)</SelectItem>
                      <SelectItem value="xbox" disabled>
                        Xbox (Coming Soon)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Username/Gamertag</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={handleGenerateCode}
                  disabled={isLoading || !username}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Generate Verification Code'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  To verify your account, please enter the verification code that you've placed in
                  your PSN profile's "About Me" section.
                </p>

                <div className="grid gap-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    placeholder="Enter verification code"
                    value={inputVerificationCode}
                    onChange={(e) => setInputVerificationCode(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('select')}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleVerifyCode}
                    disabled={isLoading || !inputVerificationCode}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manage" className="pt-4">
            {isLoadingIntegrations ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            ) : integrations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>You don't have any integrations yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border border-white/10 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{integration.platform.toUpperCase()}</h3>
                        <p className="text-sm text-muted-foreground">{integration.username}</p>
                        <div
                          className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-flex items-center ${getStatusBadgeClass(integration.verificationStatus)}`}
                        >
                          {integration.isVerified ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                            </>
                          ) : (
                            integration.verificationStatus
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {integration.isVerified ? (
                          <span className="text-xs text-muted-foreground">
                            Verified on: {formatDate(integration.verifiedAt)}
                          </span>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-900/20 text-blue-400 border-blue-800 hover:bg-blue-900/40"
                              onClick={() => prepareForVerification(integration)}
                            >
                              Verify Now
                            </Button>
                            {integration.codeExpiresAt && (
                              <span
                                className={`text-xs ${
                                  new Date() > new Date(integration.codeExpiresAt)
                                    ? 'text-red-400'
                                    : 'text-amber-400'
                                }`}
                              >
                                {new Date() > new Date(integration.codeExpiresAt)
                                  ? 'Expired: '
                                  : 'Expires: '}
                                {formatDate(integration.codeExpiresAt)}
                              </span>
                            )}
                            {integration.verificationCode && (
                              <div className="mt-2 text-xs text-gray-400">
                                <p>Verification code:</p>
                                <code className="block bg-gray-900/50 p-1 mt-1 rounded font-mono">
                                  {integration.verificationCode}
                                </code>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <AlertDialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verification Code Generated</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              Add the following code to your {selectedPlatform.toUpperCase()} profile's "About Me"
              section:
              <code className="block bg-muted p-3 rounded-md font-mono text-center text-lg mt-2">
                {verificationCode}
              </code>
              <span className="block mt-2 text-amber-500">
                This code expires in 10 minutes. After adding this code to your profile, visit the
                "Manage Integrations" tab to verify your account.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogClose}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
