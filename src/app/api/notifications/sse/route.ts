import { prisma } from '@/lib/prisma';
import { NotificationStatus } from '@/types/notifications';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const encoder = new TextEncoder();

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const controller = new TransformStream();
  const writer = controller.writable.getWriter();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
    };

    const stream = new ReadableStream({
      async start(controller) {
        let isConnectionClosed = false;

        // Handle client disconnection
        request.signal.addEventListener('abort', () => {
          isConnectionClosed = true;
          controller.close();
        });

        // Keep connection alive with periodic pings
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
                userId: decoded.id,
                status: 'UNREAD',
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            if (notifications.length > 0) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ notifications })}\n\n`
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
        }, 5000);

        // Clean up on connection close
        request.signal.addEventListener('abort', () => {
          clearInterval(pingInterval);
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE connection error:', error);
    const body = JSON.stringify({ error: 'Failed to establish SSE connection' });
    return new Response(body, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
