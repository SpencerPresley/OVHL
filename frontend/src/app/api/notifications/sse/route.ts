import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
// TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
import { verify } from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';

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
 * - Validates user authentication via JWT or NextAuth
 * - Sends periodic pings (every 5s) to keep connection alive
 * - Checks for new notifications on each ping
 * - Handles connection cleanup on client disconnect
 *
 * @param {Request} request - Incoming request object
 * @returns {Response} SSE stream response or 204 for unauthenticated users
 */
export async function GET(request: Request) {
  try {
    // Validate authentication - Check for NextAuth session first
    const session = await getServerSession(AuthOptions);
    let userId: string | undefined;

    if (session?.user?.id) {
      // User is authenticated with NextAuth
      userId = session.user.id;
    } else {
      // Fall back to token-based auth
      const cookieStore = await cookies();
      // TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
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
      // TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
      try {
        const decoded = verify(token.value, process.env.JWT_SECRET!) as {
          id: string;
        };
        userId = decoded.id;
      } catch (error) {
        console.error('Token verification failed:', error);
        // Invalid token, return 204 as well
        return new Response(null, {
          status: 204,
          headers: {
            'Cache-Control': 'no-cache, no-transform',
            'Content-Type': 'text/event-stream',
          },
        });
      }
    }

    // If we still don't have a userId, return 204
    if (!userId) {
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
