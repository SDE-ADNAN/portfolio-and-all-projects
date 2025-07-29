import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';
import logger from '@/config/logger';
import { addMessageToDeliveryQueue, addMessageToSearchQueue } from '@/services/messageQueue';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const getMessagesSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  before: z.string().uuid().optional(),
  after: z.string().uuid().optional(),
  search: z.string().optional(),
});

const sendMessageSchema = z.object({
  chatId: z.string().uuid('Invalid chat ID'),
  content: z.string().min(1, 'Message content is required'),
  type: z.enum(['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker']).default('text'),
  replyToId: z.string().uuid().optional(),
  mediaUrl: z.string().optional(),
});

const editMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

const deleteMessageSchema = z.object({
  deleteForEveryone: z.boolean().default(false),
});

const addReactionSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required'),
});

// GET /api/messages/:chatId
router.get('/:chatId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId } = req.params;
  const validatedData = getMessagesSchema.parse(req.query);
  
  // Check if user is participant in chat
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: currentUserId,
      isActive: true,
    },
  });
  
  if (!participant) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CHAT_NOT_FOUND',
        message: 'Chat not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Build where clause for messages
  const whereClause: any = {
    chatId,
    isDeleted: false,
  };
  
  if (validatedData.before) {
    whereClause.createdAt = { lt: new Date(validatedData.before) };
  } else if (validatedData.after) {
    whereClause.createdAt = { gt: new Date(validatedData.after) };
  }
  
  if (validatedData.search) {
    whereClause.content = { contains: validatedData.search, mode: 'insensitive' };
  }
  
  // Get messages
  const messages = await prisma.message.findMany({
    where: whereClause,
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
      messageReactions: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      messageStatuses: {
        where: { userId: currentUserId },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: validatedData.limit,
  });
  
  // Get total count for pagination
  const total = await prisma.message.count({
    where: {
      chatId,
      isDeleted: false,
      ...(validatedData.search ? {
        content: { contains: validatedData.search},
      } : {}),
    },
  });
  
  // Mark messages as read
  const unreadMessages = messages.filter(msg => 
    msg.senderId !== currentUserId && 
    msg.messageStatuses?.[0] && 
    !msg.messageStatuses[0].readAt
  );

  if (unreadMessages.length > 0) {
    await prisma.messageStatus.updateMany({
      where: {
        messageId: { in: unreadMessages.map(msg => msg.id) },
        userId: currentUserId,
      },
      data: {
        status: 'read',
        readAt: new Date(),
      },
    });
  }
  
  res.json({
    success: true,
    data: {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total,
        limit: validatedData.limit,
        hasMore: total > validatedData.limit,
      },
    },
  });
}));

// POST /api/messages/:chatId
router.post('/:chatId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId } = req.params;
  const validatedData = sendMessageSchema.parse(req.body);
  
  // Check if user is participant in chat
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: currentUserId,
      isActive: true,
    },
  });
  
  if (!participant) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CHAT_NOT_FOUND',
        message: 'Chat not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Validate reply message exists
  if (validatedData.replyToId) {
    const replyMessage = await prisma.message.findFirst({
      where: {
        id: validatedData.replyToId,
        chatId,
        isDeleted: false,
      },
    });
    
    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REPLY_MESSAGE_NOT_FOUND',
          message: 'Reply message not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }
  }
  
  // Create message
  const message = await prisma.message.create({
    data: {
      chatId,
      senderId: currentUserId,
      content: validatedData.content,
      messageType: validatedData.type,
      mediaUrl: validatedData.mediaUrl,
      replyToId: validatedData.replyToId,
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
    status: participant.userId === currentUserId ? 'sent' : 'sent',
  }));
  
  await prisma.messageStatus.createMany({
    data: messageStatuses,
  });
  
  // Update chat last activity
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });
  
  // Add message to delivery and search queues
  await Promise.all([
    addMessageToDeliveryQueue(message.id, chatId, currentUserId),
    addMessageToSearchQueue(message.id),
  ]);
  
  logger.info('Message sent', { 
    messageId: message.id,
    chatId,
    senderId: currentUserId,
  });
  
  res.status(201).json({
    success: true,
    data: {
      message: {
        ...message,
        status: 'sent',
      },
    },
  });
}));

// PUT /api/messages/:chatId/:messageId
router.put('/:chatId/:messageId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId, messageId } = req.params;
  const validatedData = editMessageSchema.parse(req.body);
  
  // Check if message exists and belongs to user
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      chatId,
      senderId: currentUserId,
      isDeleted: false,
    },
  });
  
  if (!message) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message not found or you cannot edit it',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Update message
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: validatedData.content,
      isEdited: true,
      editedAt: new Date(),
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
  
  logger.info('Message edited', { 
    messageId,
    chatId,
    editedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: updatedMessage,
  });
}));

// DELETE /api/messages/:chatId/:messageId
router.delete('/:chatId/:messageId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId, messageId } = req.params;
  const validatedData = deleteMessageSchema.parse(req.body);
  
  // Check if message exists
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      chatId,
      isDeleted: false,
    },
  });
  
  if (!message) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user can delete the message
  const canDelete = message.senderId === currentUserId || validatedData.deleteForEveryone;
  
  if (!canDelete) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You can only delete your own messages',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  if (validatedData.deleteForEveryone) {
    // Delete for everyone
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedForEveryone: true,
        deletedAt: new Date(),
      },
    });
  } else {
    // Delete for sender only
    await prisma.messageStatus.updateMany({
      where: {
        messageId,
        userId: currentUserId,
      },
      data: {
        status: 'DELETED',
        updatedAt: new Date()
      },
    });
  }
  
  logger.info('Message deleted', { 
    messageId,
    chatId,
    deletedBy: currentUserId,
    deleteForEveryone: validatedData.deleteForEveryone,
  });
  
  res.json({
    success: true,
    data: {
      message: 'Message deleted successfully',
    },
  });
}));

// POST /api/messages/:chatId/:messageId/reactions
router.post('/:chatId/:messageId/reactions', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId, messageId } = req.params;
  const validatedData = addReactionSchema.parse(req.body);
  
  // Check if message exists
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      chatId,
      isDeleted: false,
    },
  });
  
  if (!message) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user is participant in chat
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: currentUserId,
      isActive: true,
    },
  });
  
  if (!participant) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CHAT_NOT_FOUND',
        message: 'Chat not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Add or update reaction
  const reaction = await prisma.messageReaction.upsert({
    where: {
      messageId_userId_emoji: {
        messageId,
        userId: currentUserId,
        emoji: validatedData.emoji,
      },
    },
    update: {},
    create: {
      messageId,
      userId: currentUserId,
      emoji: validatedData.emoji,
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
  
  logger.info('Message reaction added', { 
    messageId,
    emoji: validatedData.emoji,
    userId: currentUserId,
  });
  
  res.json({
    success: true,
    data: reaction,
  });
}));

// DELETE /api/messages/:chatId/:messageId/reactions/:emoji
router.delete('/:chatId/:messageId/reactions/:emoji', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId, messageId, emoji } = req.params;
  
  // Check if message exists
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      chatId,
      isDeleted: false,
    },
  });
  
  if (!message) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Remove reaction
  await prisma.messageReaction.deleteMany({
    where: {
      messageId,
      userId: currentUserId,
      emoji,
    },
  });
  
  logger.info('Message reaction removed', { 
    messageId,
    emoji,
    userId: currentUserId,
  });
  
  res.json({
    success: true,
    data: {
      message: 'Reaction removed successfully',
    },
  });
}));

// POST /api/messages/:chatId/:messageId/read
router.post('/:chatId/:messageId/read', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId, messageId } = req.params;
  
  // Check if message exists
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      chatId,
      isDeleted: false,
    },
  });
  
  if (!message) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Mark message as read
  await prisma.messageStatus.updateMany({
    where: {
      messageId,
      userId: currentUserId,
    },
    data: {
      status: 'read',
      readAt: new Date(),
    },
  });
  
  logger.info('Message marked as read', { 
    messageId,
    readBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: {
      message: 'Message marked as read',
    },
  });
}));

// GET /api/messages/search
router.get('/search', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { q: query, chatId, limit = 20, offset = 0 } = req.query;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_QUERY',
        message: 'Search query is required',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Build where clause
  const whereClause: any = {
    isDeleted: false,
    content: { contains: query, mode: 'insensitive' },
  };
  
  // Filter by chat if specified
  if (chatId && typeof chatId === 'string') {
    whereClause.chatId = chatId;
  }
  
  // Get user's chats for filtering
  const userChats = await prisma.chatParticipant.findMany({
    where: { 
      userId: currentUserId,
      isActive: true,
    },
    select: { chatId: true },
  });
  
  whereClause.chatId = { in: userChats.map(c => c.chatId) };
  
  // Search messages
  const messages = await prisma.message.findMany({
    where: whereClause,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      chat: {
        select: {
          id: true,
          name: true,
          type: true,
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
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: Number(offset),
  });
  
  // Get total count
  const total = await prisma.message.count({
    where: whereClause,
  });
  
  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: total > Number(limit) + Number(offset),
      },
    },
  });
}));

export default router; 