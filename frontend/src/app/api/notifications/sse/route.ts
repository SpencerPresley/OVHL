import { NextRequest, NextResponse } from 'next/server';
import { getSessionSafely } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// Remove unused imports 
// import { AuthOptions } from '@/lib/auth-options'; 
// import redis from '@/lib/redis';
// import { cookies, headers } from 'next/headers';
// Fix the import path - this utility doesn't seem to exist or has a different path
// import createNotificationCounter from '@/app/utils/notifications-counter';

/**
 * TextEncoder instance for converting strings to Uint8Array
 * Used for SSE message encoding
 */
const encoder = new TextEncoder();

/**
 * GET handler for SSE notifications endpoint
 *
 * Establishes a persistent SSE connection and streams notifications to authenticated users.
 * The connection:
 * - Validates user authentication via Auth.js
 * - Sends periodic pings (every 5s) to keep connection alive
 * - Checks for new notifications on each ping
 * - Handles connection cleanup on client disconnect
 *
 * @param {Request} request - Incoming request object
 * @returns {Response} SSE stream response or 204 for unauthenticated users
 */
export async function GET(request: NextRequest) {
  try {
    // Use our safe wrapper that's compatible with Auth.js
    const session = await getSessionSafely();
    
    // If there's no user, return an empty response
    if (!session?.user) {
      return new NextResponse(null, { status: 204 });
    }

    // User is authenticated with Auth.js
    const userId = session.user.id;

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        let isConnectionClosed = false;

        // Handle client disconnection
        request.signal.addEventListener('abort', () => {
          isConnectionClosed = true;
          controller.close();
        });

        // Keep connection alive with periodic pings and notification checks
        const pingInterval = setInterval(async () => {
          if (isConnectionClosed) {
            clearInterval(pingInterval);
            return;
          }

          try {
            // Send ping to keep connection alive
            controller.enqueue(encoder.encode(': ping\n\n'));

            // Check for new notifications
            const notifications = await prisma.notification.findMany({
              where: {
                userId,
                status: 'UNREAD',
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            // Send notifications if any exist
            if (notifications.length > 0) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'notifications', data: notifications })}\n\n`
                )
              );
            }
          } catch (error) {
            console.error('Error checking for notifications:', error);
            if (!isConnectionClosed) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: 'Error checking notifications' })}\n\n`
                )
              );
            }
          }
        }, 5000); // Check every 5 seconds

        // Clean up interval on connection close
        request.signal.addEventListener('abort', () => {
          clearInterval(pingInterval);
        });
      },
    });

    // Return SSE stream response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE connection error:', error);
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/event-stream',
      },
    });
  }
}
