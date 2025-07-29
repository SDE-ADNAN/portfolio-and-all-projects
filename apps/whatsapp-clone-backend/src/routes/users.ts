import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';
import logger from '@/config/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  status: z.string().max(200).optional(),
  about: z.string().max(500).optional(),
  privacySettings: z.object({
    lastSeen: z.boolean().optional(),
    profilePicture: z.boolean().optional(),
    status: z.boolean().optional(),
  }).optional(),
  notificationSettings: z.object({
    messages: z.boolean().optional(),
    calls: z.boolean().optional(),
    groups: z.boolean().optional(),
  }).optional(),
});

const searchUsersSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const blockUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// GET /api/users/profile
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      phone: true,
      profilePictureUrl: true,
      status: true,
      about: true,
      lastSeen: true,
      isOnline: true,
      isVerified: true,
      privacySettings: true,
      notificationSettings: true,
      createdAt: true,
      updatedAt: true,
    },
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
  
  res.json({
    success: true,
    data: user,
  });
}));

// PUT /api/users/profile
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const validatedData = updateProfileSchema.parse(req.body);
  
  // Check if username is already taken (if being updated)
  if (validatedData.username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: validatedData.username,
        id: { not: userId },
      },
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USERNAME_TAKEN',
          message: 'Username is already taken',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }
  }
  
  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      username: validatedData.username,
      status: validatedData.status,
      about: validatedData.about,
      privacySettings: validatedData.privacySettings as any,
      notificationSettings: validatedData.notificationSettings as any,
    },
    select: {
      id: true,
      email: true,
      username: true,
      phone: true,
      profilePictureUrl: true,
      status: true,
      about: true,
      lastSeen: true,
      isOnline: true,
      isVerified: true,
      privacySettings: true,
      notificationSettings: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  logger.info('User profile updated', { userId });
  
  res.json({
    success: true,
    data: updatedUser,
  });
}));

// GET /api/users/search
router.get('/search', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const validatedData = searchUsersSchema.parse(req.query);
  
  // Search users by username, email, or phone
  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { username: { contains: validatedData.query} },
            { email: { contains: validatedData.query} },
            { phone: { contains: validatedData.query} },
          ],
        },
        { id: { not: userId } }, // Exclude current user
        { isBlocked: false }, // Exclude blocked users
      ],
    },
    select: {
      id: true,
      username: true,
      profilePictureUrl: true,
      status: true,
      isOnline: true,
      lastSeen: true,
    },
    take: validatedData.limit,
    skip: validatedData.offset,
    orderBy: [
      { isOnline: 'desc' },
      { username: 'asc' },
    ],
  });
  
  // Get total count for pagination
  const total = await prisma.user.count({
    where: {
      AND: [
        {
          OR: [
            { username: { contains: validatedData.query} },
            { email: { contains: validatedData.query} },
            { phone: { contains: validatedData.query} },
          ],
        },
        { id: { not: userId } },
        { isBlocked: false },
      ],
    },
  });
  
  res.json({
    success: true,
    data: {
      users,
      pagination: {
        total,
        limit: validatedData.limit,
        offset: validatedData.offset,
        hasMore: total > validatedData.offset + validatedData.limit,
      },
    },
  });
}));

// GET /api/users/:userId
router.get('/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { userId } = req.params;
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profilePictureUrl: true,
      status: true,
      about: true,
      isOnline: true,
      lastSeen: true,
      privacySettings: true,
    },
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
  
  // Check if current user has blocked this user
  const isBlocked = await prisma.userRelationship.findFirst({
    where: {
      userId: currentUserId,
      relatedUserId: userId,
      relationshipType: 'blocked',
    },
  });
  
  if (isBlocked) {
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
  
  // Apply privacy settings
  const privacySettings = user.privacySettings as any;
  const userData = {
    id: user.id,
    username: user.username,
    profilePictureUrl: privacySettings?.profilePicture !== false ? user.profilePictureUrl : null,
    status: privacySettings?.status !== false ? user.status : null,
    about: user.about,
    isOnline: privacySettings?.lastSeen !== false ? user.isOnline : null,
    lastSeen: privacySettings?.lastSeen !== false ? user.lastSeen : null,
  };
  
  res.json({
    success: true,
    data: userData,
  });
}));

// POST /api/users/block
router.post('/block', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const validatedData = blockUserSchema.parse(req.body);
  
  if (currentUserId === validatedData.userId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'CANNOT_BLOCK_SELF',
        message: 'Cannot block yourself',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: validatedData.userId },
  });
  
  if (!targetUser) {
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
  
  // Create or update block relationship
  await prisma.userRelationship.upsert({
    where: {
      userId_relatedUserId_relationshipType: {
        userId: currentUserId,
        relatedUserId: validatedData.userId,
        relationshipType: 'blocked',
      },
    },
    update: {},
    create: {
      userId: currentUserId,
      relatedUserId: validatedData.userId,
      relationshipType: 'blocked',
    },
  });
  
  logger.info('User blocked', { 
    currentUserId, 
    blockedUserId: validatedData.userId 
  });
  
  res.json({
    success: true,
    data: {
      message: 'User blocked successfully',
    },
  });
}));

// POST /api/users/unblock
router.post('/unblock', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const validatedData = blockUserSchema.parse(req.body);
  
  // Remove block relationship
  await prisma.userRelationship.deleteMany({
    where: {
      userId: currentUserId,
      relatedUserId: validatedData.userId,
      relationshipType: 'blocked',
    },
  });
  
  logger.info('User unblocked', { 
    currentUserId, 
    unblockedUserId: validatedData.userId 
  });
  
  res.json({
    success: true,
    data: {
      message: 'User unblocked successfully',
    },
  });
}));

// GET /api/users/blocked
router.get('/blocked', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  
  const blockedUsers = await prisma.userRelationship.findMany({
    where: {
      userId: currentUserId,
      relationshipType: 'blocked',
    },
    include: {
      relatedUser: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
  });
  
  res.json({
    success: true,
    data: {
      blockedUsers: blockedUsers.map(block => block.relatedUser),
    },
  });
}));

// POST /api/users/contacts
router.post('/contacts', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { phoneNumbers } = req.body;
  
  if (!Array.isArray(phoneNumbers)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Phone numbers must be an array',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Find users by phone numbers
  const contacts = await prisma.user.findMany({
    where: {
      phone: { in: phoneNumbers },
      id: { not: currentUserId },
      isBlocked: false,
    },
    select: {
      id: true,
      username: true,
      phone: true,
      profilePictureUrl: true,
      status: true,
      isOnline: true,
      lastSeen: true,
    },
  });
  
  // Create contact relationships
  const contactRelationships = contacts.map(contact => ({
    userId: currentUserId,
    relatedUserId: contact.id,
    relationshipType: 'contact' as const,
  }));
  
  await prisma.userRelationship.createMany({
    data: contactRelationships,
    // skipDuplicates: true,
  });
  
  res.json({
    success: true,
    data: {
      contacts,
      totalFound: contacts.length,
      totalRequested: phoneNumbers.length,
    },
  });
}));

// GET /api/users/contacts
router.get('/contacts', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  
  const contacts = await prisma.userRelationship.findMany({
    where: {
      userId: currentUserId,
      relationshipType: 'contact',
    },
    include: {
      relatedUser: {
        select: {
          id: true,
          username: true,
          phone: true,
          profilePictureUrl: true,
          status: true,
          isOnline: true,
          lastSeen: true,
        },
      },
    },
  });
  
  res.json({
    success: true,
    data: {
      contacts: contacts.map(contact => contact.relatedUser),
    },
  });
}));

export default router; 