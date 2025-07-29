import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import logger from '@/config/logger';
import redisClient from '@/config/redis';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

// WebSocket authentication middleware
const authenticateSocket = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, username: true },
    });
    
    if (!user) {
      return next(new Error('User not found'));
    }
    
    // Attach user info to socket
    socket.userId = user.id;
    socket.userEmail = user.email;
    
    logger.info('WebSocket authenticated', { userId: user.id, socketId: socket.id });
    next();
  } catch (error) {
    logger.error('WebSocket authentication failed', { error, socketId: socket.id });
    next(new Error('Invalid authentication token'));
  }
};

// Connection management
const handleConnection = async (socket: AuthenticatedSocket) => {
  try {
    if (!socket.userId) {
      socket.disconnect();
      return;
    }
    
    // Update user online status
    await prisma.user.update({
      where: { id: socket.userId },
      data: { 
        isOnline: true,
        lastSeen: new Date(),
      },
    });
    
    // Join user to their personal room
    socket.join(`user:${socket.userId}`);
    
    // Get user's active chats
    const userChats = await prisma.chatParticipant.findMany({
      where: { 
        userId: socket.userId,
        isActive: true,
      },
      include: {
        chat: true,
      },
    });
    
    // Join user to all their chat rooms
    userChats.forEach((participant) => {
      socket.join(`chat:${participant.chatId}`);
    });
    
    // Broadcast user online status to all chat participants
    userChats.forEach(async (participant) => {
      const chatParticipants = await prisma.chatParticipant.findMany({
        where: { 
          chatId: participant.chatId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      
      chatParticipants.forEach((chatParticipant) => {
        if (chatParticipant.userId !== socket.userId) {
          socket.to(`user:${chatParticipant.userId}`).emit('user:online', {
            userId: socket.userId,
            chatId: participant.chatId,
          });
        }
      });
    });
    
    logger.info('WebSocket connected', { 
      userId: socket.userId, 
      socketId: socket.id,
      chatCount: userChats.length,
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      await handleDisconnection(socket);
    });
    
    // Handle message sending
    socket.on('message:send', async (data) => {
      await handleMessageSend(socket, data);
    });
    
    // Handle typing indicators
    socket.on('message:typing', async (data) => {
      await handleTypingIndicator(socket, data, true);
    });
    
    socket.on('message:stop_typing', async (data) => {
      await handleTypingIndicator(socket, data, false);
    });
    
    // Handle message read
    socket.on('message:read', async (data) => {
      await handleMessageRead(socket, data);
    });
    
    // Handle user status updates
    socket.on('user:status_update', async (data) => {
      await handleUserStatusUpdate(socket, data);
    });
    
  } catch (error) {
    logger.error('WebSocket connection setup failed', { error, socketId: socket.id });
    socket.disconnect();
  }
};

// Handle disconnection
const handleDisconnection = async (socket: AuthenticatedSocket) => {
  try {
    if (!socket.userId) return;
    
    // Update user offline status
    await prisma.user.update({
      where: { id: socket.userId },
      data: { 
        isOnline: false,
        lastSeen: new Date(),
      },
    });
    
    // Get user's active chats for broadcasting offline status
    const userChats = await prisma.chatParticipant.findMany({
      where: { 
        userId: socket.userId,
        isActive: true,
      },
    });
    
    // Broadcast user offline status
    userChats.forEach(async (participant) => {
      const chatParticipants = await prisma.chatParticipant.findMany({
        where: { 
          chatId: participant.chatId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      
      chatParticipants.forEach((chatParticipant) => {
        if (chatParticipant.userId !== socket.userId) {
          socket.to(`user:${chatParticipant.userId}`).emit('user:offline', {
            userId: socket.userId,
            chatId: participant.chatId,
          });
        }
      });
    });
    
    logger.info('WebSocket disconnected', { 
      userId: socket.userId, 
      socketId: socket.id,
    });
  } catch (error) {
    logger.error('WebSocket disconnection handling failed', { error, socketId: socket.id });
  }
};

// Handle message sending
const handleMessageSend = async (socket: AuthenticatedSocket, data: any) => {
  try {
    const { chatId, content, type = 'text', replyToId, mediaUrl } = data;
    
    if (!chatId || !content) {
      socket.emit('error', { message: 'Chat ID and content are required' });
      return;
    }
    
    // Verify user is participant in chat
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: socket.userId,
        isActive: true,
      },
    });
    
    if (!participant) {
      socket.emit('error', { message: 'Not a participant in this chat' });
      return;
    }
    
    // Create message
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: socket.userId,
        content,
        messageType: type,
        mediaUrl,
        replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    
    // Create message status for all participants
    const chatParticipants = await prisma.chatParticipant.findMany({
      where: { 
        chatId,
        isActive: true,
      },
    });
    
    const messageStatuses = chatParticipants.map((participant) => ({
      messageId: message.id,
      userId: participant.userId,
      status: participant.userId === socket.userId ? 'sent' : 'sent',
    }));
    
    await prisma.messageStatus.createMany({
      data: messageStatuses,
    });
    
    // Broadcast message to chat room
    const messageData = {
      id: message.id,
      chatId: message.chatId,
      sender: message.sender,
      content: message.content,
      type: message.messageType,
      mediaUrl: message.mediaUrl,
      replyTo: message.replyTo,
      status: 'sent',
      createdAt: message.createdAt,
    };
    
    socket.to(`chat:${chatId}`).emit('message:received', messageData);
    
    // Emit confirmation to sender
    socket.emit('message:sent', {
      messageId: message.id,
      status: 'sent',
    });
    
    logger.info('Message sent', { 
      messageId: message.id,
      chatId,
      senderId: socket.userId,
    });
    
  } catch (error) {
    logger.error('Message sending failed', { error, socketId: socket.id });
    socket.emit('error', { message: 'Failed to send message' });
  }
};

// Handle typing indicators
const handleTypingIndicator = async (socket: AuthenticatedSocket, data: any, isTyping: boolean) => {
  try {
    const { chatId } = data;
    
    if (!chatId) {
      socket.emit('error', { message: 'Chat ID is required' });
      return;
    }
    
    // Verify user is participant in chat
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: socket.userId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    
    if (!participant) {
      socket.emit('error', { message: 'Not a participant in this chat' });
      return;
    }
    
    const typingData = {
      chatId,
      userId: socket.userId,
      username: participant.user.username,
      isTyping,
    };
    
    // Broadcast typing indicator to other chat participants
    socket.to(`chat:${chatId}`).emit(
      isTyping ? 'message:typing' : 'message:stop_typing',
      typingData
    );
    
  } catch (error) {
    logger.error('Typing indicator handling failed', { error, socketId: socket.id });
  }
};

// Handle message read
const handleMessageRead = async (socket: AuthenticatedSocket, data: any) => {
  try {
    const { messageId } = data;
    
    if (!messageId) {
      socket.emit('error', { message: 'Message ID is required' });
      return;
    }
    
    // Update message status to read
    await prisma.messageStatus.updateMany({
      where: {
        messageId,
        userId: socket.userId,
      },
      data: {
        status: 'read',
        updatedAt: new Date(),
      },
    });
    
    // Get message details
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: true,
      },
    });
    
    if (!message) {
      socket.emit('error', { message: 'Message not found' });
      return;
    }
    
    // Broadcast read receipt to message sender
    socket.to(`user:${message.senderId}`).emit('message:read', {
      messageId,
      chatId: message.chatId,
      readBy: socket.userId,
    });
    
    logger.info('Message marked as read', { 
      messageId,
      readBy: socket.userId,
    });
    
  } catch (error) {
    logger.error('Message read handling failed', { error, socketId: socket.id });
  }
};

// Handle user status updates
const handleUserStatusUpdate = async (socket: AuthenticatedSocket, data: any) => {
  try {
    const { status } = data;
    
    // Update user status
    await prisma.user.update({
      where: { id: socket.userId },
      data: { status },
    });
    
    // Get user's active chats
    const userChats = await prisma.chatParticipant.findMany({
      where: { 
        userId: socket.userId,
        isActive: true,
      },
    });
    
    // Broadcast status update to all chat participants
    userChats.forEach(async (participant) => {
      const chatParticipants = await prisma.chatParticipant.findMany({
        where: { 
          chatId: participant.chatId,
          isActive: true,
        },
      });
      
      chatParticipants.forEach((chatParticipant) => {
        if (chatParticipant.userId !== socket.userId) {
          socket.to(`user:${chatParticipant.userId}`).emit('user:status_updated', {
            userId: socket.userId,
            status,
            chatId: participant.chatId,
          });
        }
      });
    });
    
    logger.info('User status updated', { 
      userId: socket.userId,
      status,
    });
    
  } catch (error) {
    logger.error('User status update failed', { error, socketId: socket.id });
  }
};

// Setup WebSocket server
export const setupWebSocket = (io: Server) => {
  // Apply authentication middleware
  io.use(authenticateSocket);
  
  // Handle connections
  io.on('connection', handleConnection);
  
  logger.info('WebSocket server setup complete');
}; 