import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';
import logger from '@/config/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createChatSchema = z.object({
  type: z.enum(['individual', 'group']),
  name: z.string().optional(),
  description: z.string().optional(),
  participantIds: z.array(z.string().uuid()).min(1, 'At least one participant is required'),
});

const updateChatSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  settings: z.object({
    muteNotifications: z.boolean().optional(),
    pinChat: z.boolean().optional(),
  }).optional(),
});

const addParticipantSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['member', 'moderator']).default('member'),
});

const updateParticipantRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'moderator']),
});

// GET /api/chats
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const { limit = 20, offset = 0, search } = req.query;
  
  // Get user's active chats
  const userChats = await prisma.chatParticipant.findMany({
    where: {
      userId,
      isActive: true,
      chat: {
        isActive: true,
        ...(search ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        } : {}),
      },
    },
    include: {
      chat: {
        include: {
          participants: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profilePictureUrl: true,
                  isOnline: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      chat: {
        updatedAt: 'desc',
      },
    },
    take: Number(limit),
    skip: Number(offset),
  });
  
  // Get unread message counts
  const chatsWithUnreadCounts = await Promise.all(
    userChats.map(async (participant) => {
      const unreadCount = await prisma.message.count({
        where: {
          chatId: participant.chatId,
          senderId: { not: userId },
          createdAt: {
            gt: participant.lastReadAt || new Date(0),
          },
        },
      });
      
      return {
        ...participant.chat,
        unreadCount,
        lastMessage: participant.chat.messages[0] || null,
        participantCount: participant.chat.participants.length,
      };
    })
  );
  
  res.json({
    success: true,
    data: {
      chats: chatsWithUnreadCounts,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        hasMore: userChats.length === Number(limit),
      },
    },
  });
}));

// POST /api/chats
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const validatedData = createChatSchema.parse(req.body);
  
  // Validate participants exist
  const participants = await prisma.user.findMany({
    where: {
      id: { in: validatedData.participantIds },
    },
    select: { id: true },
  });
  
  if (participants.length !== validatedData.participantIds.length) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PARTICIPANTS',
        message: 'Some participants do not exist',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // For individual chats, check if chat already exists
  if (validatedData.type === 'individual' && validatedData.participantIds.length === 1) {
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: 'individual',
        participants: {
          every: {
            userId: { in: [currentUserId, validatedData.participantIds[0]] },
          },
        },
      },
      include: {
        participants: true,
      },
    });
    
    if (existingChat && existingChat.participants.length === 2) {
      return res.json({
        success: true,
        data: {
          chat: existingChat,
          isExisting: true,
        },
      });
    }
  }
  
  // Create chat
  const chat = await prisma.chat.create({
    data: {
      type: validatedData.type,
      name: validatedData.name,
      description: validatedData.description,
      createdBy: currentUserId,
      participants: {
        create: [
          // Creator as admin
          {
            userId: currentUserId,
            role: 'admin',
          },
          // Other participants
          ...validatedData.participantIds.map(participantId => ({
            userId: participantId,
            role: 'member',
          })),
        ],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePictureUrl: true,
              isOnline: true,
            },
          },
        },
      },
    },
  });
  
  logger.info('Chat created', { 
    chatId: chat.id, 
    type: chat.type,
    createdBy: currentUserId,
  });
  
  res.status(201).json({
    success: true,
    data: {
      chat,
      isExisting: false,
    },
  });
}));

// GET /api/chats/:chatId
router.get('/:chatId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId } = req.params;
  
  // Get chat with participants
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      participants: {
        some: {
          userId: currentUserId,
          isActive: true,
        },
      },
      isActive: true,
    },
    include: {
      participants: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePictureUrl: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
    },
  });
  
  if (!chat) {
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
  
  res.json({
    success: true,
    data: chat,
  });
}));

// PUT /api/chats/:chatId
router.put('/:chatId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId } = req.params;
  const validatedData = updateChatSchema.parse(req.body);
  
  // Check if user is admin or has permission to update
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
  
  // Only admins can update group chat details
  if (validatedData.name || validatedData.description) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          where: {
            userId: currentUserId,
            role: 'admin',
          },
        },
      },
    });
    
    if (!chat || chat.participants.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only admins can update chat details',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }
  }
  
  // Update chat
  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: {
      name: validatedData.name,
      description: validatedData.description,
      settings: validatedData.settings,
    },
    include: {
      participants: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePictureUrl: true,
              isOnline: true,
            },
          },
        },
      },
    },
  });
  
  logger.info('Chat updated', { chatId, updatedBy: currentUserId });
  
  res.json({
    success: true,
    data: updatedChat,
  });
}));

// POST /api/chats/:chatId/participants
router.post('/:chatId/participants', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId } = req.params;
  const validatedData = addParticipantSchema.parse(req.body);
  
  // Check if user is admin
  const isAdmin = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: currentUserId,
      role: 'admin',
      isActive: true,
    },
  });
  
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Only admins can add participants',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: validatedData.userId },
  });
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user is already a participant
  const existingParticipant = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: validatedData.userId,
      isActive: true,
    },
  });
  
  if (existingParticipant) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'USER_ALREADY_PARTICIPANT',
        message: 'User is already a participant in this chat',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Add participant
  const participant = await prisma.chatParticipant.create({
    data: {
      chatId,
      userId: validatedData.userId,
      role: validatedData.role,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
          isOnline: true,
        },
      },
    },
  });
  
  logger.info('Participant added to chat', { 
    chatId, 
    userId: validatedData.userId,
    addedBy: currentUserId,
  });
  
  res.status(201).json({
    success: true,
    data: participant,
  });
}));

// DELETE /api/chats/:chatId/participants/:userId
router.delete('/:chatId/participants/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId, userId } = req.params;
  
  // Check if user is admin or removing themselves
  const isAdmin = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: currentUserId,
      role: 'admin',
      isActive: true,
    },
  });
  
  const isSelfRemoval = currentUserId === userId;
  
  if (!isAdmin && !isSelfRemoval) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Only admins can remove participants',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Remove participant
  await prisma.chatParticipant.updateMany({
    where: {
      chatId,
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
      leftAt: new Date(),
    },
  });
  
  logger.info('Participant removed from chat', { 
    chatId, 
    userId,
    removedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: {
      message: 'Participant removed successfully',
    },
  });
}));

// PUT /api/chats/:chatId/participants/:userId/role
router.put('/:chatId/participants/:userId/role', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId, userId } = req.params;
  const validatedData = updateParticipantRoleSchema.parse(req.body);
  
  // Check if user is admin
  const isAdmin = await prisma.chatParticipant.findFirst({
    where: {
      chatId,
      userId: currentUserId,
      role: 'admin',
      isActive: true,
    },
  });
  
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Only admins can update participant roles',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Update participant role
  const participant = await prisma.chatParticipant.update({
    where: {
      chatId_userId: {
        chatId,
        userId,
      },
    },
    data: {
      role: validatedData.role,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
  });
  
  logger.info('Participant role updated', { 
    chatId, 
    userId,
    newRole: validatedData.role,
    updatedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: participant,
  });
}));

// POST /api/chats/:chatId/leave
router.post('/:chatId/leave', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId } = req.params;
  
  // Check if user is a participant
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
  
  // Leave chat
  await prisma.chatParticipant.update({
    where: {
      id: participant.id,
    },
    data: {
      isActive: false,
      leftAt: new Date(),
    },
  });
  
  logger.info('User left chat', { chatId, userId: currentUserId });
  
  res.json({
    success: true,
    data: {
      message: 'Successfully left the chat',
    },
  });
}));

export default router; 