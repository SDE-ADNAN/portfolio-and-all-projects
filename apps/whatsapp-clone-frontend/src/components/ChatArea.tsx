'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Socket } from 'socket.io-client';
import MessageSearch from './MessageSearch';

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
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker';
  mediaUrl?: string;
  replyToId?: string;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      username: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isDeleted: boolean;
  reactions: Array<{
    id: string;
    emoji: string;
    userId: string;
    user: {
      id: string;
      username: string;
    };
  }>;
}

interface ChatAreaProps {
  chat: Chat;
  user: User | null;
  socket: Socket | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({ chat, user, socket }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMessages();
  }, [chat.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('message:new', handleNewMessage);
      socket.on('message:update', handleMessageUpdate);
      socket.on('message:delete', handleMessageDelete);
      socket.on('typing:start', handleTypingStart);
      socket.on('typing:stop', handleTypingStop);

      return () => {
        socket.off('message:new');
        socket.off('message:update');
        socket.off('message:delete');
        socket.off('typing:start');
        socket.off('typing:stop');
      };
    }
  }, [socket, chat.id]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${chat.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: Message) => {
    if (message.chatId === chat.id) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleMessageUpdate = (updatedMessage: Message) => {
    if (updatedMessage.chatId === chat.id) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
    }
  };

  const handleMessageDelete = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isDeleted: true }
          : msg
      )
    );
  };

  const handleTypingStart = (data: { chatId: string; userId: string; username: string }) => {
    if (data.chatId === chat.id && data.userId !== user?.id) {
      setTypingUsers(prev => new Set([...prev, data.username]));
    }
  };

  const handleTypingStop = (data: { chatId: string; userId: string }) => {
    if (data.chatId === chat.id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        // Remove the user who stopped typing
        newSet.delete(data.userId);
        return newSet;
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    try {
      socket.emit('message:send', {
        chatId: chat.id,
        content: newMessage.trim(),
        messageType: 'text',
      });

      setNewMessage('');
      stopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startTyping = () => {
    if (!socket || isTyping) return;

    setIsTyping(true);
    socket.emit('typing:start', { chatId: chat.id });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!socket || !isTyping) return;

    setIsTyping(false);
    socket.emit('typing:stop', { chatId: chat.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (e.target.value) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getChatName = () => {
    if (chat.type === 'group') {
      return chat.name;
    }
    
    const otherParticipant = chat.participants.find(p => p.id !== user?.id);
    return otherParticipant?.username || chat.name;
  };

  const getChatAvatar = () => {
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

  if (loading) {
    return (
      <div className="whatsapp-chat flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#008069] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="whatsapp-chat">
      {/* Chat Header */}
      <div className="whatsapp-header">
        <div className="flex items-center space-x-3">
          {getChatAvatar()}
          <div className="flex-1">
            <h2 className="font-semibold">{getChatName()}</h2>
            <p className="text-sm opacity-90">
              {chat.type === 'group' 
                ? `${chat.participants.length} participants`
                : chat.participants.find(p => p.id !== user?.id)?.isOnline 
                  ? 'Online' 
                  : 'Offline'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSearch(true)}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            
            if (message.isDeleted) {
              return (
                <div key={message.id} className="text-center text-gray-500 text-sm italic">
                  This message was deleted
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`whatsapp-message-bubble ${
                  isOwnMessage ? 'whatsapp-message-sent' : 'whatsapp-message-received'
                }`}>
                  {message.replyTo && (
                    <div className="whatsapp-reply-message mb-2">
                      <div className="whatsapp-reply-sender">
                        {message.replyTo.sender.username}
                      </div>
                      <div className="whatsapp-reply-content">
                        {message.replyTo.content}
                      </div>
                    </div>
                  )}
                  
                  <div className="message-content">
                    {message.messageType === 'text' ? (
                      <p>{message.content}</p>
                    ) : (
                      <div className="whatsapp-media-message">
                        {/* TODO: Handle different message types */}
                        <p>Media message</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTime(message.createdAt)}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-500 ml-2">(edited)</span>
                    )}
                  </div>
                  
                  {message.reactions.length > 0 && (
                    <div className="flex items-center space-x-1 mt-1">
                      {message.reactions.map((reaction) => (
                        <span key={reaction.id} className="text-xs bg-gray-200 px-1 rounded">
                          {reaction.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="whatsapp-message-bubble whatsapp-message-received">
              <div className="whatsapp-typing-indicator">
                <div className="whatsapp-typing-dot" />
                <div className="whatsapp-typing-dot" />
                <div className="whatsapp-typing-dot" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="whatsapp-input-container">
        <div className="whatsapp-input">
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            className="flex-1 px-3 py-2 bg-transparent outline-none"
          />
          
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 text-[#008069] hover:text-[#006d5b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Message Search Modal */}
      <MessageSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onMessageSelect={(message) => {
          // TODO: Navigate to the specific message in the chat
          console.log('Selected message:', message);
        }}
      />
    </div>
  );
};

export default ChatArea; 