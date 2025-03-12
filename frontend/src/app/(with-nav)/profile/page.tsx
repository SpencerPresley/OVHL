'use client';

import { useUserProfile } from '@/hooks/use-user-profile';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileTabs } from './components/ProfileTabs';
import { ProfileTab } from './components/ProfileTab';
import { AccountTab } from './components/AccountTab';

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

          <ProfileTabs 
            profileTab={
              <ProfileTab
                formData={{
                  name: formData.name,
                  username: formData.username,
                  avatarUrl: formData.avatarUrl,
                }}
                initials={initials}
                onAvatarUpload={updateAvatar}
                onAvatarRemove={removeAvatar}
                onProfileSubmit={updateProfile}
                onFieldChange={updateFormField}
              />
            }
            accountTab={
              <AccountTab
                email={formData.email}
                isAdmin={user.isAdmin}
                onEmailChange={(value) => updateFormField('email', value)}
                onResetPassword={resetPassword}
                onDeleteAccount={deleteAccount}
              />
            }
            // Additional tabs can be added here in the future:
            // securityTab={<SecurityTab />}
            // notificationsTab={<NotificationsTab />}
            // integrationsTab={<IntegrationsTab />}
          />
        </div>
      </main>
    </div>
  );
}
