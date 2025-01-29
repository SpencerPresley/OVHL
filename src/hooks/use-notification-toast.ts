"use client";

import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/types/notifications";

export function useNotificationToast() {
  const { toast } = useToast();

  const showNotificationToast = (notification: Notification, onOpenSheet?: () => void) => {
    toast({
      title: notification.title,
      description: notification.message,
      duration: 2000,
      className: "notification-toast cursor-pointer",
      onClick: () => {
        onOpenSheet?.();
      },
    });
  };

  return { showNotificationToast };
} 