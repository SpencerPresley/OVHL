'use client'

import * as Ably from 'ably';
import { AblyProvider, useChannel, ChannelProvider } from 'ably/react';
import { useEffect, useState, useMemo } from 'react';
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
 * - Real-time message updates with consistent ordering
 * - User presence tracking per channel with live online count
 * - Persistent message history across page reloads
 * - Clickable usernames linking to profile pages
 * - Message limit (100) with automatic pruning
 * - Multi-browser support with unique client IDs
 * - Emoji support and rich text formatting
 * 
 * Message Handling:
 * - Messages are stored chronologically (oldest to newest)
 * - Display is reversed to show newest messages at top
 * - History is loaded on component mount
 * - New messages are appended to maintain order
 * 
 * User Experience:
 * - Loading states during history fetch
 * - Empty state prompts for first message
 * - Proper message wrapping and emoji display
 * - Responsive height based on screen size
 *
 * @component
 * @param {ChatProps} props - Component properties
 */
function ChatComponent({ leagueId, currentUser }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to all messages on the channel
  const { channel } = useChannel(`league-chat:${leagueId}`, (message) => {
    if (message.name === 'message') {
      setMessages(prev => {
        // Always add new messages to the end and maintain order
        const newMessages = [...prev, message.data as ChatMessage];
        // Keep only the last MAX_MESSAGES
        return newMessages.slice(-MAX_MESSAGES);
      });
    }
  });

  useEffect(() => {
    if (!channel) return;

    // Load message history
    const loadHistory = async () => {
      try {
        // Get messages in reverse order (oldest first) with a larger limit
        const history = await channel.history({ 
          limit: MAX_MESSAGES,
          direction: 'forwards' // Get oldest messages first
        });
        
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
            No messages yet. Be the first to chat! 👋
          </div>
        ) : (
          <div className="flex flex-col-reverse space-y-reverse space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="bg-gray-700 rounded p-2">
                <Link 
                  href={`/users/${msg.userId}`}
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                >
                  {msg.username}
                </Link>
                <span className="text-gray-400">: </span>
                <span className="text-white whitespace-pre-wrap break-words">{msg.text}</span>
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
          placeholder="Type a message... 😊"
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-[16px]"
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
 * Chat Provider Component
 * 
 * Wraps the chat component with necessary providers for Ably integration.
 * Creates and uses a memoized Ably client instance to enable:
 * - Single persistent connection for all chats
 * - Multiple simultaneous channel subscriptions
 * - Efficient connection management
 * - Cross-browser support
 * 
 * Configuration:
 * - Uses token auth for security
 * - Enables message echoing for consistent display
 * - Automatic cleanup on page unload
 * - Channel-specific capabilities
 *
 * @component
 * @param {ChatProps} props - Component properties
 */
const Chat = function Chat({ leagueId, currentUser }: ChatProps) {
  console.log('Chat: Initializing for league', leagueId);
  
  // Create a memoized client instance that persists across renders
  const client = useMemo(() => {
    console.log('Chat: Creating new Ably client');
    return new Ably.Realtime({
      authUrl: '/api/ably',
      authMethod: 'GET',
      echoMessages: true,
      closeOnUnload: true
    });
  }, []);
  
  const channelName = `league-chat:${leagueId}`;
  console.log('Chat: Using channel', channelName);

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={channelName}>
        <ChatComponent leagueId={leagueId} currentUser={currentUser} />
      </ChannelProvider>
    </AblyProvider>
  );
};

export default Chat;