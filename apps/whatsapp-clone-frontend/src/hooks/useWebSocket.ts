import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

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

interface Chat {
  id: string;
  name: string;
  type: 'individual' | 'group';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  participants: Array<{
    id: string;
    username: string;
    profilePictureUrl?: string;
    isOnline?: boolean;
    lastSeen?: Date;
  }>;
  lastMessage?: Message;
  unreadCount: number;
}

interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          socketInstance.connect();
        }, 1000 * reconnectAttempts.current);
      }
    });

    socketInstance.on('message:new', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('message:update', (updatedMessage: Message) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
    });

    socketInstance.on('message:delete', (messageId: string) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isDeleted: true }
            : msg
        )
      );
    });

    socketInstance.on('chat:new', (chat: Chat) => {
      setChats(prev => [chat, ...prev]);
    });

    socketInstance.on('chat:update', (updatedChat: Chat) => {
      setChats(prev => 
        prev.map(chat => 
          chat.id === updatedChat.id ? updatedChat : chat
        )
      );
    });

    socketInstance.on('user:status', (status: UserStatus) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status.isOnline) {
          newSet.add(status.userId);
        } else {
          newSet.delete(status.userId);
        }
        return newSet;
      });
    });

    socketInstance.on('typing:start', (data: { chatId: string; userId: string; username: string }) => {
      // Handle typing indicator
      console.log(`${data.username} is typing...`);
    });

    socketInstance.on('typing:stop', (data: { chatId: string; userId: string }) => {
      // Handle typing stop
      console.log('Typing stopped');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);

  const sendMessage = (chatId: string, content: string, messageType: Message['messageType'] = 'text', mediaUrl?: string, replyToId?: string) => {
    if (!socket || !isConnected) {
      throw new Error('WebSocket not connected');
    }

    socket.emit('message:send', {
      chatId,
      content,
      messageType,
      mediaUrl,
      replyToId,
    });
  };

  const editMessage = (messageId: string, content: string) => {
    if (!socket || !isConnected) {
      throw new Error('WebSocket not connected');
    }

    socket.emit('message:edit', {
      messageId,
      content,
    });
  };

  const deleteMessage = (messageId: string, deleteForEveryone: boolean = false) => {
    if (!socket || !isConnected) {
      throw new Error('WebSocket not connected');
    }

    socket.emit('message:delete', {
      messageId,
      deleteForEveryone,
    });
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!socket || !isConnected) {
      throw new Error('WebSocket not connected');
    }

    socket.emit('message:reaction:add', {
      messageId,
      emoji,
    });
  };

  const removeReaction = (messageId: string, emoji: string) => {
    if (!socket || !isConnected) {
      throw new Error('WebSocket not connected');
    }

    socket.emit('message:reaction:remove', {
      messageId,
      emoji,
    });
  };

  const startTyping = (chatId: string) => {
    if (!socket || !isConnected) {
      return;
    }

    socket.emit('typing:start', { chatId });
  };

  const stopTyping = (chatId: string) => {
    if (!socket || !isConnected) {
      return;
    }

    socket.emit('typing:stop', { chatId });
  };

  const joinChat = (chatId: string) => {
    if (!socket || !isConnected) {
      return;
    }

    socket.emit('chat:join', { chatId });
  };

  const leaveChat = (chatId: string) => {
    if (!socket || !isConnected) {
      return;
    }

    socket.emit('chat:leave', { chatId });
  };

  return {
    socket,
    isConnected,
    messages,
    chats,
    onlineUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping,
    joinChat,
    leaveChat,
  };
}; 