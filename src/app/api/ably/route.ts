import * as Ably from 'ably';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    if (!process.env.ABLY_API_KEY) {
        throw new Error('ABLY_API_KEY is not set');
    }
    const client = new Ably.Realtime(process.env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'ably-nextjs-demo' });
    return Response.json(tokenRequestData);
}