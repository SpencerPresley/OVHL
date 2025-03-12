import * as Ably from 'ably';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * Ably authentication endpoint
 *
 * This endpoint provides Ably token requests for authenticated users only.
 * It strictly requires authentication via Auth.js.
 * Anonymous users are rejected with a 401 Unauthorized response.
 */
export async function GET() {
  try {
    if (!process.env.ABLY_API_KEY) {
      return NextResponse.json({ error: 'Ably API key not configured' }, { status: 500 });
    }

    // This will throw an error if not authenticated
    // Our updated requireAuth function now uses Auth.js
    const user = await requireAuth();

    // Create an Ably client with the API key
    const client = new Ably.Rest(process.env.ABLY_API_KEY);

    // Create a token request with appropriate capabilities
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: user.id,
      capability: {
        'league-chat:*': ['publish', 'subscribe', 'presence', 'history'],
      },
    });

    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error('Ably auth error:', error);
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
}
