'use client';

import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileTabsProps {
  defaultTab?: string;
  profileTab: ReactNode;
  accountTab: ReactNode;
  // We can easily add more tabs here in the future
  securityTab?: ReactNode;
  notificationsTab?: ReactNode;
  integrationsTab?: ReactNode;
}

export function ProfileTabs({
  defaultTab = 'profile',
  profileTab,
  accountTab,
  securityTab,
  notificationsTab,
  integrationsTab,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        {securityTab && <TabsTrigger value="security">Security</TabsTrigger>}
        {notificationsTab && <TabsTrigger value="notifications">Notifications</TabsTrigger>}
        {integrationsTab && <TabsTrigger value="integrations">Integrations</TabsTrigger>}
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        {profileTab}
      </TabsContent>

      <TabsContent value="account" className="space-y-6">
        {accountTab}
      </TabsContent>

      {securityTab && (
        <TabsContent value="security" className="space-y-6">
          {securityTab}
        </TabsContent>
      )}

      {notificationsTab && (
        <TabsContent value="notifications" className="space-y-6">
          {notificationsTab}
        </TabsContent>
      )}

      {integrationsTab && (
        <TabsContent value="integrations" className="space-y-6">
          {integrationsTab}
        </TabsContent>
      )}
    </Tabs>
  );
} 