'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Chat {
  id: string;
  name: string;
  type: 'individual' | 'group';
  lastMessage?: {
    content: string;
    timestamp: Date;
    sender: {
      username: string;
    };
  };
  unreadCount: number;
  participants: Array<{
    id: string;
    username: string;
    profilePictureUrl?: string;
    isOnline?: boolean;
  }>;
}

const ChatInterface: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('chat:new', handleNewChat);
      socket.on('chat:update', handleChatUpdate);
      socket.on('message:new', handleNewMessage);
      socket.on('user:status', handleUserStatus);

      return () => {
        socket.off('chat:new');
        socket.off('chat:update');
        socket.off('message:new');
        socket.off('user:status');
      };
    }
  }, [socket]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.data.chats);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = (chat: Chat) => {
    setChats(prev => [chat, ...prev]);
  };

  const handleChatUpdate = (updatedChat: Chat) => {
    setChats(prev => 
      prev.map(chat => 
        chat.id === updatedChat.id ? updatedChat : chat
      )
    );
  };

  const handleNewMessage = (message: any) => {
    setChats(prev => 
      prev.map(chat => {
        if (chat.id === message.chatId) {
          return {
            ...chat,
            lastMessage: {
              content: message.content,
              timestamp: new Date(message.createdAt),
              sender: {
                username: message.sender.username,
              },
            },
            unreadCount: chat.unreadCount + 1,
          };
        }
        return chat;
      })
    );
  };

  const handleUserStatus = (statusUpdate: any) => {
    setChats(prev => 
      prev.map(chat => ({
        ...chat,
        participants: chat.participants.map(participant => 
          participant.id === statusUpdate.userId 
            ? { ...participant, isOnline: statusUpdate.isOnline }
            : participant
        ),
      }))
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#008069] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="whatsapp-container">
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onChatSelect={setSelectedChat}
        onLogout={handleLogout}
        user={user}
        isConnected={isConnected}
      />
      {selectedChat ? (
        <ChatArea
          chat={selectedChat}
          user={user}
          socket={socket}
        />
      ) : (
        <div className="whatsapp-chat flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to WhatsApp Clone
            </h2>
            <p className="text-gray-500">
              Select a chat to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface; 