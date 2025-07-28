'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

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

interface User {
  id: string;
  email: string;
  username: string;
  profilePictureUrl?: string;
  status?: string;
  about?: string;
  lastSeen?: Date;
  isOnline?: boolean;
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onLogout: () => void;
  user: User | null;
  isConnected: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChat,
  onChatSelect,
  onLogout,
  user,
  isConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name;
    }
    
    // For individual chats, show the other participant's name
    const otherParticipant = chat.participants.find(p => p.id !== user?.id);
    return otherParticipant?.username || chat.name;
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return (
        <div className="whatsapp-avatar">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      );
    }

    const otherParticipant = chat.participants.find(p => p.id !== user?.id);
    if (otherParticipant?.profilePictureUrl) {
      return (
        <img
          src={otherParticipant.profilePictureUrl}
          alt={otherParticipant.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="whatsapp-avatar">
        {otherParticipant?.username?.charAt(0).toUpperCase() || '?'}
      </div>
    );
  };

  return (
    <div className="whatsapp-sidebar">
      {/* Header */}
      <div className="whatsapp-header">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="whatsapp-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className={`whatsapp-status-indicator absolute -bottom-1 -right-1 ${
              isConnected ? 'whatsapp-status-online' : 'whatsapp-status-offline'
            }`} />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{user?.username || 'User'}</h2>
            <p className="text-sm opacity-90">
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  // TODO: Open profile modal
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  // TODO: Open settings modal
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Settings
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="whatsapp-search">
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="whatsapp-search-input"
          />
          <svg className="whatsapp-search-icon w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={`whatsapp-chat-item ${
                selectedChat?.id === chat.id ? 'active' : ''
              }`}
            >
              <div className="relative">
                {getChatAvatar(chat)}
                {chat.type === 'individual' && chat.participants.find(p => p.id !== user?.id)?.isOnline && (
                  <div className="whatsapp-status-indicator whatsapp-status-online absolute -bottom-1 -right-1" />
                )}
              </div>
              
              <div className="whatsapp-chat-preview">
                <div className="flex items-center justify-between">
                  <h3 className="whatsapp-chat-name">{getChatName(chat)}</h3>
                  {chat.lastMessage && (
                    <span className="whatsapp-chat-time">
                      {formatTime(chat.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                
                {chat.lastMessage ? (
                  <p className="whatsapp-chat-message">
                    <span className="font-medium">
                      {chat.lastMessage.sender.username === user?.username ? 'You: ' : ''}
                    </span>
                    {chat.lastMessage.content}
                  </p>
                ) : (
                  <p className="whatsapp-chat-message text-gray-400">
                    No messages yet
                  </p>
                )}
              </div>
              
              {chat.unreadCount > 0 && (
                <div className="whatsapp-chat-unread">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            // TODO: Open new chat modal
          }}
          className="w-full whatsapp-button flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar; 