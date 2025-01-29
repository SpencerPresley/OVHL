"use client";

import { useEffect, useState } from "react";
import { Notification } from "@/types/notifications";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function NotificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch(`/api/notifications/${id}`);
        if (!response.ok) throw new Error("Failed to fetch notification");
        const data = await response.json();
        setNotification(data.notification);
      } catch (error) {
        console.error("Error fetching notification:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!notification) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Notification not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>{notification.title}</CardTitle>
          </div>
          <CardDescription>
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{notification.message}</p>
          {notification.metadata && (
            <pre className="mt-4 p-4 bg-muted rounded-lg overflow-auto">
              {JSON.stringify(notification.metadata, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    </div>
  );
} 