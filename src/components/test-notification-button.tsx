'use client';

import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import { useNotifications } from '@/hooks/use-notifications';

export function TestNotificationButton() {
  const { fetchNotifications } = useNotifications();

  const createTestNotification = useCallback(
    async (withLink: boolean = false) => {
      try {
        const response = await fetch('/api/notifications/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ withLink }),
        });
        if (!response.ok) {
          throw new Error('Failed to create test notification');
        }
        // Force refresh notifications after creating a new one
        await fetchNotifications();
      } catch (error) {
        console.error('Error creating test notification:', error);
      }
    },
    [fetchNotifications]
  );

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => createTestNotification(false)}
        variant="outline"
        className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      >
        Test Notification
      </Button>
      <Button
        onClick={() => createTestNotification(true)}
        variant="outline"
        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/50"
      >
        Test Linked Notification
      </Button>
    </div>
  );
}
