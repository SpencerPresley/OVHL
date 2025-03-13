'use client';

import { useUserProfile } from '@/hooks/use-user-profile';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileTabs } from './components/ProfileTabs';
import { ProfileTab } from './components/ProfileTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AvatarUpload } from './avatar-upload';
import { AccountTab } from './components/AccountTab';
import { IntegrationsTab } from './components/IntegrationsTab';
import { PSNProfileTab } from './components/PSNProfileTab';

export default function ProfilePage() {
  const {
    user,
    loading,
    formData,
    updateProfile,
    updateAvatar,
    removeAvatar,
    resetPassword,
    deleteAccount,
    updateFormField,
    getUserInitials,
  } = useUserProfile();

  if (loading || !user) return null;

  const initials = getUserInitials();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="container py-6">
        <div className="max-w-5xl mx-auto">
          <ProfileHeader userId={user.id} />

          <div className="space-y-8">
            <div>
              <AvatarUpload
                imageUrl={user?.avatarUrl || null}
                initials={initials}
                name={user?.name || ''}
                username={user?.username || null}
                onUpload={updateAvatar}
                onRemove={removeAvatar}
              />
            </div>

            <Tabs defaultValue="account" className="space-y-4">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="psn">PSN Profile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
                <AccountTab
                  email={user?.email || ''}
                  isAdmin={user?.isAdmin || false}
                  onEmailChange={(value) => updateFormField('email', value)}
                  onResetPassword={resetPassword}
                  onDeleteAccount={deleteAccount}
                />
              </TabsContent>
              
              <TabsContent value="integrations">
                <IntegrationsTab />
              </TabsContent>
              
              <TabsContent value="psn">
                <PSNProfileTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
