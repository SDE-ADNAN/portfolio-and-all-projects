'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    profilePictureUrl?: string;
  };
  chat: {
    id: string;
    name: string;
    type: 'individual' | 'group';
  };
  replyTo?: {
    id: string;
    content: string;
    sender: {
      username: string;
    };
  };
  createdAt: Date;
}

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSelect?: (message: Message) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ 
  isOpen, 
  onClose, 
  onMessageSelect 
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [chats, setChats] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        searchMessages();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setMessages([]);
    }
  }, [query, selectedChatId]);

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
    }
  };

  const searchMessages = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        q: query,
        limit: '50',
      });

      if (selectedChatId) {
        params.append('chatId', selectedChatId);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/search?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Failed to search messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (message: Message) => {
    if (onMessageSelect) {
      onMessageSelect(message);
    }
    onClose();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Search Messages</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedChatId}
              onChange={(e) => setSelectedChatId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All chats</option>
              {chats.map((chat) => (
                <option key={chat.id} value={chat.id}>
                  {chat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {query ? 'No messages found' : 'Start typing to search messages'}
            </div>
          ) : (
            <div className="divide-y">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        {message.sender.profilePictureUrl ? (
                          <img
                            src={message.sender.profilePictureUrl}
                            alt={message.sender.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold">
                            {message.sender.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">
                          {message.sender.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          in {message.chat.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(message.createdAt)} at {formatTime(message.createdAt)}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-700">
                        {highlightText(message.content, query)}
                      </div>
                      
                      {message.replyTo && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          <span className="font-medium">Reply to {message.replyTo.sender.username}:</span>
                          <div className="mt-1 truncate">
                            {message.replyTo.content}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSearch; 