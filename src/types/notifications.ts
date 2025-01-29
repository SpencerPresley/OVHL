export enum NotificationType {
  SYSTEM = "SYSTEM",
  FORUM = "FORUM",
  TEAM = "TEAM",
  LEAGUE = "LEAGUE",
  MATCH = "MATCH",
  CUSTOM = "CUSTOM",
}

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
  ARCHIVED = "ARCHIVED",
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  link?: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
} 