'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserService } from '@/lib/services/user-service';
import { Nav } from '@/components/nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ProfileForm } from './profile-form';
import { AccountForm } from './account-form';
import { useToast } from '@/hooks/use-toast';
import { AvatarUpload } from './avatar-upload';

interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  isAdmin: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  resetToken: string | null;
  resetTokenExpiresAt: Date | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    avatarUrl: null as string | null,
  });

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await UserService.getCurrentUser();
        if (!userData) {
          throw new Error('Not authenticated');
        }
        setUser(userData);
        setFormData({
          name: userData.name || '',
          username: userData.username || '',
          email: userData.email,
          avatarUrl: userData.avatarUrl,
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updatedUser = await UserService.updateProfile(user.id, formData);
      setUser({
        ...updatedUser,
        avatarUrl: user.avatarUrl, // Preserve the avatar URL since it's not part of the update
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetPassword = async () => {
    // TODO: Implement password reset
    toast({
      title: 'Coming Soon',
      description: 'Password reset functionality will be available soon.',
    });
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    toast({
      title: 'Coming Soon',
      description: 'Account deletion functionality will be available soon.',
    });
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    try {
      const updatedUser = await UserService.updateAvatar(user.id, file);
      setUser(updatedUser);
      setFormData((prev) => ({
        ...prev,
        avatarUrl: updatedUser.avatarUrl,
      }));
      toast({
        title: 'Avatar Updated',
        description: 'Your avatar has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarRemove = async () => {
    if (!user) return;

    try {
      const updatedUser = await UserService.removeAvatar(user.id);
      setUser(updatedUser);
      setFormData((prev) => ({
        ...prev,
        avatarUrl: null,
      }));
      toast({
        title: 'Avatar Removed',
        description: 'Your avatar has been successfully removed.',
      });
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      toast({
        title: 'Removal Failed',
        description: 'Failed to remove avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading || !user) return null;

  const initials = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Nav />
      <main className="container py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and profile information
              </p>
            </div>
            <Link
              href={`/users/${user.id}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
              View Public Profile
            </Link>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Update your profile information visible to other users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AvatarUpload
                    imageUrl={formData.avatarUrl}
                    initials={initials}
                    name={formData.name}
                    username={formData.username}
                    onUpload={handleAvatarUpload}
                    onRemove={handleAvatarRemove}
                  />

                  <Separator className="bg-white/10" />

                  <ProfileForm
                    formData={{ name: formData.name, username: formData.username }}
                    onSubmit={handleProfileSubmit}
                    onChange={handleFieldChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AccountForm
                    email={formData.email}
                    isAdmin={user.isAdmin}
                    onEmailChange={(value) => handleFieldChange('email', value)}
                    onResetPassword={handleResetPassword}
                    onDeleteAccount={handleDeleteAccount}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
