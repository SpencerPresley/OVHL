"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  MessageSquare,
  Shield,
  Trophy,
  Users2,
  Archive,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationStatus, NotificationType } from "@/types/notifications";
import { useRouter } from "next/navigation";

interface NotificationListProps {
  filter: "all" | "unread" | "archived";
  onAction?: () => void;
}

const notificationIcons = {
  [NotificationType.SYSTEM]: Bell,
  [NotificationType.FORUM]: MessageSquare,
  [NotificationType.TEAM]: Users2,
  [NotificationType.LEAGUE]: Trophy,
  [NotificationType.MATCH]: Shield,
  [NotificationType.CUSTOM]: Bell,
};

export function NotificationList({ filter, onAction }: NotificationListProps) {
  const router = useRouter();
  const { notifications, markAsRead, archiveNotification, restoreNotification } =
    useNotifications();

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return notification.status === NotificationStatus.UNREAD;
    if (filter === "archived") return notification.status === NotificationStatus.ARCHIVED;
    return true;
  });

  const handleNotificationClick = async (
    notification: {
      id: string;
      status: NotificationStatus;
      link?: string | null;
    },
    event: React.MouseEvent
  ) => {
    // Don't trigger if clicking action buttons
    if ((event.target as HTMLElement).closest("button")) return;

    if (notification.status === NotificationStatus.UNREAD) {
      await markAsRead(notification.id);
    }

    if (notification.link) {
      router.push(notification.link);
      onAction?.();
    } else {
      // If there's no link, we still want to mark it as read but keep the sheet open
      // Don't call onAction() here to keep the sheet open
    }
  };

  if (filteredNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Bell className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No notifications to show</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => {
        const Icon = notificationIcons[notification.type];
        return (
          <div
            key={notification.id}
            className={`relative flex gap-4 rounded-lg p-4 transition-colors cursor-pointer ${
              notification.status === NotificationStatus.UNREAD
                ? "bg-blue-500/10 hover:bg-blue-500/20"
                : "hover:bg-accent"
            }`}
            onClick={(e) => handleNotificationClick(notification, e)}
          >
            <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-none">{notification.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={async () => {
                            if (notification.status === NotificationStatus.ARCHIVED) {
                              await restoreNotification(notification.id);
                            } else {
                              await archiveNotification(notification.id);
                            }
                          }}
                        >
                          {notification.status === NotificationStatus.ARCHIVED ? (
                            <RotateCcw className="h-4 w-4" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {notification.status === NotificationStatus.ARCHIVED
                          ? "Restore notification"
                          : "Archive notification"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 