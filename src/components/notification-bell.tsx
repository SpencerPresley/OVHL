"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "@/components/notification-list";
import { useNotifications } from "@/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const { unreadCount, isOpen, setIsOpen } = useNotifications();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-transparent hover:text-blue-400 h-9 w-9 p-0"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center min-w-[1rem]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="unread" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[calc(100vh-10rem)] mt-2 pr-4">
            <TabsContent value="unread" className="mt-0">
              <NotificationList
                filter="unread"
                onAction={() => setIsOpen(false)}
              />
            </TabsContent>
            <TabsContent value="archived" className="mt-0">
              <NotificationList
                filter="archived"
                onAction={() => setIsOpen(false)}
              />
            </TabsContent>
            <TabsContent value="all" className="mt-0">
              <NotificationList filter="all" onAction={() => setIsOpen(false)} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
} 