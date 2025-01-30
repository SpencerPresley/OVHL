'use client'

import * as Ably from 'ably';
import { AblyProvider, useChannel, ChannelProvider } from 'ably/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Props for the Chat component
 * @interface ChatProps
 */
export interface ChatProps {
  /** ID of the league this chat belongs to */
  leagueId: string;
  /** Information about the currently authenticated user */
  currentUser: {
    /** User's unique identifier */
    id: string;
    /** User's display name */
    name: string;
  };
}

/**
 * Structure of a chat message
 * @interface ChatMessage
 */
interface ChatMessage {
  /** The message text content */
  text: string;
  /** The username of the message sender */
  username: string;
  /** The user ID of the message sender */
  userId: string;
  /** Timestamp when the message was sent */
  timestamp: number;
}

/** Maximum number of messages to keep in the chat history */
const MAX_MESSAGES = 100;

/**
 * Chat Component
 * 
 * A real-time chat component that uses Ably for message delivery.
 * Features:
 * - Real-time message updates
 * - User presence tracking per channel
 * - Message history for each league
 * - User profile links
 * - Message limit to prevent memory issues
 * - Simultaneous chat support across multiple leagues
 * 
 * Messages are displayed newest-first and limited to MAX_MESSAGES.
 * Each username is a clickable link to that user's profile.
 * Users can participate in multiple league chats simultaneously.
 *
 * @component
 * @param {ChatProps} props - Component properties
 */
function ChatComponent({ leagueId, currentUser }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { channel } = useChannel(`league-chat-${leagueId}`, (message) => {
    setMessages(prev => {
      const newMessages = [message.data as ChatMessage, ...prev];
      return newMessages.slice(0, MAX_MESSAGES);
    });
  });

  useEffect(() => {
    if (!channel) return;

    // Load message history
    const loadHistory = async () => {
      try {
        const history = await channel.history({ limit: MAX_MESSAGES });
        const historicalMessages = history.items
          .map(item => item.data as ChatMessage);
        setMessages(historicalMessages);
      } catch (error) {
        console.error('Failed to load message history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Subscribe to presence updates
    const onPresenceUpdate = () => {
      channel.presence.get().then(members => {
        setOnlineUsers(members?.length || 0);
      });
    };

    loadHistory();
    onPresenceUpdate();

    // Subscribe to presence events
    channel.presence.subscribe(['enter', 'leave'], onPresenceUpdate);

    // Enter the presence set
    channel.presence.enter({ username: currentUser.name });

    return () => {
      channel.presence.unsubscribe();
      channel.presence.leave();
    };
  }, [channel, currentUser]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const message: ChatMessage = {
      text: inputMessage,
      username: currentUser.name,
      userId: currentUser.id,
      timestamp: Date.now(),
    };

    channel.publish('message', message);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-[600px] lg:h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">League Chat</h2>
        <span className="text-sm text-gray-400">
          {onlineUsers} online
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 bg-gray-800 rounded-lg p-4 mb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No messages yet. Be the first to chat!
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="bg-gray-700 rounded p-2">
                <Link 
                  href={`/users/${msg.userId}`}
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                >
                  {msg.username}
                </Link>
                <span className="text-gray-400">: </span>
                <span className="text-white">{msg.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}

/**
 * Single Ably client instance shared across all chat instances
 * This allows for efficient connection management and
 * simultaneous participation in multiple league chats
 */
const client = new Ably.Realtime({ authUrl: '/api/ably' });

/**
 * Chat Provider Component
 * 
 * Wraps the chat component with necessary providers for Ably integration.
 * Uses a shared Ably client instance to enable:
 * - Single connection for all chats
 * - Multiple channel subscriptions
 * - Efficient resource usage
 * - Simultaneous chat participation
 *
 * @component
 * @param {ChatProps} props - Component properties
 */
const Chat = function Chat({ leagueId, currentUser }: ChatProps) {
  const channelName = `league-chat-${leagueId}`;

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={channelName}>
        <ChatComponent leagueId={leagueId} currentUser={currentUser} />
      </ChannelProvider>
    </AblyProvider>
  );
};

export default Chat;