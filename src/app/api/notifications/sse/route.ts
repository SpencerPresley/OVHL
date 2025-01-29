import { prisma } from "@/lib/prisma";
import { NotificationStatus } from "@/types/notifications";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const encoder = new TextEncoder();

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      const body = JSON.stringify({ error: "Authentication required" });
      return new Response(body, {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
    };

    const stream = new ReadableStream({
      start: async (controller) => {
        // Send initial connection message
        const message = encoder.encode(`data: ${JSON.stringify({ type: "connection", status: "connected" })}\n\n`);
        controller.enqueue(message);

        // Check for notifications immediately
        try {
          const notifications = await prisma.notification.findMany({
            where: {
              userId: decoded.id,
              status: NotificationStatus.UNREAD,
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          if (notifications.length > 0) {
            const data = encoder.encode(`data: ${JSON.stringify({ type: "notifications", data: notifications })}\n\n`);
            controller.enqueue(data);
          }
        } catch (error) {
          console.error("Error checking for notifications:", error);
        }

        // Set up interval for checking notifications
        const timer = setInterval(async () => {
          try {
            // Send ping to keep connection alive
            controller.enqueue(encoder.encode(": ping\n\n"));

            // Check for new notifications
            const notifications = await prisma.notification.findMany({
              where: {
                userId: decoded.id,
                status: NotificationStatus.UNREAD,
              },
              orderBy: {
                createdAt: "desc",
              },
            });

            if (notifications.length > 0) {
              const data = encoder.encode(`data: ${JSON.stringify({ type: "notifications", data: notifications })}\n\n`);
              controller.enqueue(data);
            }
          } catch (error) {
            console.error("Error checking for notifications:", error);
            // Don't throw error here, just log it to keep the connection alive
          }
        }, 15000).unref(); // Unref the timer so it doesn't keep the process alive

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          clearInterval(timer);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("SSE connection error:", error);
    const body = JSON.stringify({ error: "Failed to establish SSE connection" });
    return new Response(body, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
} 