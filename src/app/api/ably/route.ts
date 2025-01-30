import * as Ably from 'ably';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    if (!process.env.ABLY_API_KEY) {
        throw new Error('ABLY_API_KEY is not set');
    }

    // Get the user's ID from their auth token to use as client ID
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    let clientId = 'anonymous-' + Math.random().toString(36).substring(7);

    if (token?.value) {
        try {
            const decoded = verify(token.value, process.env.JWT_SECRET!) as { id: string };
            clientId = decoded.id;
        } catch (error) {
            console.error('Error verifying token for Ably clientId:', error);
        }
    }

    // Create an Ably client with the API key
    const client = new Ably.Rest(process.env.ABLY_API_KEY);

    // Create a token request with appropriate capabilities
    const tokenRequestData = await client.auth.createTokenRequest({
        clientId,
        capability: {
            // Grant full access to league chat channels
            'league-chat:*': ['publish', 'subscribe', 'presence', 'history']
        }
    });

    return Response.json(tokenRequestData);
}