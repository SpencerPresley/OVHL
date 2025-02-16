/**
 * @file route.ts
 * @author Spencer Presley
 * @version 1.0.0
 * @license Proprietary - Copyright (c) 2025 Spencer Presley
 * @copyright All rights reserved. This code is the exclusive property of Spencer Presley.
 * @notice Unauthorized copying, modification, distribution, or use is strictly prohibited.
 *
 * @description Server-Sent Events (SSE) API Route for Real-Time Notifications
 * @module api/notifications/sse
 *
 * @requires next/server
 * @requires jsonwebtoken
 * @requires @prisma/client
 *
 * Server-Sent Events (SSE) Notification Streaming Endpoint
 *
 * Features:
 * - Persistent real-time notification connection
 * - JWT-based authentication
 * - Efficient connection management
 * - Automatic reconnection handling
 *
 * Technical Implementation:
 * - Uses ReadableStream for efficient data streaming
 * - Periodic ping to maintain connection
 * - Secure token validation
 * - Graceful error handling
 *
 * Performance Considerations:
 * - Minimal server resource consumption
 * - Low-latency notification delivery
 * - Scalable connection management
 *
 * @example
 * // Client-side SSE connection
 * const eventSource = new EventSource('/api/notifications/sse');
 * eventSource.onmessage = (event) => {
 *   const notifications = JSON.parse(event.data);
 *   // Handle notifications
 * };
 */

import { prisma } from '@/lib/prisma';
import { NotificationStatus } from '@/types/notifications';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

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
 * - Validates user authentication via JWT
 * - Sends periodic pings (every 5s) to keep connection alive
 * - Checks for new notifications on each ping
 * - Handles connection cleanup on client disconnect
 *
 * @param {Request} request - Incoming request object
 * @returns {Response} SSE stream response or 204 for unauthenticated users
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const controller = new TransformStream();
  const writer = controller.writable.getWriter();

  try {
    // Validate authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      // Return a 204 No Content instead of 401 for unauthenticated users
      // This prevents aggressive reconnection attempts
      return new Response(null, {
        status: 204,
        headers: {
          'Cache-Control': 'no-cache, no-transform',
          'Content-Type': 'text/event-stream',
        },
      });
    }

    // Decode and verify JWT token
    let userId: string;
    try {
      const decoded = verify(token.value, process.env.JWT_SECRET!) as {
        id: string;
      };
      userId = decoded.id;
    } catch (error) {
      // Invalid token, return 204 as well
      return new Response(null, {
        status: 204,
        headers: {
          'Cache-Control': 'no-cache, no-transform',
          'Content-Type': 'text/event-stream',
        },
      });
    }

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
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ notifications })}\n\n`));
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
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE connection error:', error);
    return new Response(null, {
      status: 204,
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/event-stream',
      },
    });
  }
}
