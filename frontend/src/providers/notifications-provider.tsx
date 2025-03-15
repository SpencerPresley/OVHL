'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { Notification, NotificationStatus } from '@/types/notifications';
import { useNotificationToast } from '@/hooks/use-notification-toast';
import { useSession } from 'next-auth/react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Bell } from 'lucide-react';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  connected: boolean;
  markAsRead: (id: string) => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  restoreNotification: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const { showNotificationToast } = useNotificationToast();
  const prevNotificationsRef = useRef<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  // Show toasts for new notifications
  useEffect(() => {
    const prevIds = prevNotificationsRef.current;
    const newUnreadNotifications = notifications.filter(
      (n) => !prevIds.has(n.id) && n.status === NotificationStatus.UNREAD
    );

    // Update ref with current IDs
    prevNotificationsRef.current = new Set(notifications.map((n) => n.id));

    // Show toasts for new notifications
    newUnreadNotifications.forEach((notification) => {
      showNotificationToast(notification, () => setIsOpen(true));
    });
  }, [notifications, showNotificationToast]);

  const updateNotificationsState = useCallback((newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    const count = newNotifications.filter((n) => n.status === NotificationStatus.UNREAD).length;
    setUnreadCount(count);
  }, []);

  const fetchNotifications = useCallback(async () => {
    // Don't try to fetch notifications if user is not authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        if (response.status === 401 || response.status === 500) {
          // Handle auth errors silently - likely just not logged in
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      updateNotificationsState(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't show error state to users, just provide empty notifications
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [updateNotificationsState, isAuthenticated]);

  const optimisticUpdate = useCallback((id: string, newStatus: NotificationStatus) => {
    setNotifications((prev) => {
      const updatedNotifications = prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n));

      // Update unread count based on the status change
      const newUnreadCount = updatedNotifications.filter(
        (n) => n.status === NotificationStatus.UNREAD
      ).length;
      setUnreadCount(newUnreadCount);

      return updatedNotifications;
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (mounted) {
        await fetchNotifications();
      }
    };

    if (isAuthenticated) {
      initialize();
    } else {
      // Reset state when not authenticated
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }

    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      // Only connect to SSE if user is authenticated
      if (!isAuthenticated) return;

      eventSource = new EventSource('/api/notifications/sse');

      eventSource.onopen = () => {
        if (mounted) setConnected(true);
      };

      eventSource.onmessage = async (event) => {
        if (!mounted) return;

        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notifications' && Array.isArray(data.data)) {
            updateNotificationsState(data.data);
          }
        } catch (error) {
          console.error('Error processing SSE message:', error);
        }
      };

      eventSource.onerror = () => {
        if (mounted) {
          setConnected(false);
          eventSource?.close();
          setTimeout(connectSSE, 5000);
        }
      };
    };

    connectSSE();

    return () => {
      mounted = false;
      eventSource?.close();
    };
  }, [fetchNotifications, updateNotificationsState, isAuthenticated]);

  const markAsRead = async (id: string) => {
    // Skip API calls if not authenticated
    if (!isAuthenticated) return;

    optimisticUpdate(id, NotificationStatus.READ);
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      await fetchNotifications();
    }
  };

  const archiveNotification = async (id: string) => {
    // Skip API calls if not authenticated
    if (!isAuthenticated) return;

    optimisticUpdate(id, NotificationStatus.ARCHIVED);
    try {
      const response = await fetch(`/api/notifications/${id}/archive`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to archive notification');
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
      await fetchNotifications();
    }
  };

  const restoreNotification = async (id: string) => {
    // Skip API calls if not authenticated
    if (!isAuthenticated) return;

    optimisticUpdate(id, NotificationStatus.READ);
    try {
      const response = await fetch(`/api/notifications/${id}/restore`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to restore notification');
      }
    } catch (error) {
      console.error('Error restoring notification:', error);
      await fetchNotifications();
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    connected,
    markAsRead,
    archiveNotification,
    restoreNotification,
    fetchNotifications,
    isOpen,
    setIsOpen,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
