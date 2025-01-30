'use client'

import dynamic from 'next/dynamic';
import { ChatProps } from './chatbox-ably';

/**
 * Dynamic import of the chat component with loading state.
 * This prevents the chat component from being server-side rendered,
 * which is necessary because it uses WebSocket connections.
 */
const Chat = dynamic(() => import('./chatbox-ably'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-700 h-[400px] rounded-lg"></div>
});

/**
 * Client Wrapper Component for Chat
 * 
 * This component serves as a client-side wrapper for the chat functionality.
 * It's necessary to have this separate wrapper because:
 * 1. It marks the boundary between server and client components
 * 2. It handles the dynamic import of the chat component
 * 3. It provides a loading state while the chat component is being loaded
 *
 * @component
 * @param {ChatProps} props - The props required for the chat component
 * @param {string} props.leagueId - The ID of the league this chat belongs to
 * @param {Object} props.currentUser - The currently authenticated user's information
 * @returns {JSX.Element} The chat component or loading state
 */
export default function ClientWrapper({ leagueId, currentUser }: ChatProps) {
  return <Chat leagueId={leagueId} currentUser={currentUser} />;
} 
