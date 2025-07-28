import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';
import logger from '@/config/logger';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Validation schemas
const generatePresignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().min(1, 'File size is required'),
  chatId: z.string().uuid('Invalid chat ID'),
});

const processMediaSchema = z.object({
  mediaId: z.string().uuid('Invalid media ID'),
  processingType: z.enum(['compress', 'resize', 'convert']),
  options: z.record(z.any()).optional(),
});

// POST /api/media/upload-url
router.post('/upload-url', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const validatedData = generatePresignedUrlSchema.parse(req.body);
  
  // Check if user is participant in chat
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId: validatedData.chatId,
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
  
  // Generate unique file key
  const fileExtension = path.extname(validatedData.fileName);
  const fileKey = `uploads/${validatedData.chatId}/${currentUserId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
  
  // Create presigned URL
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileKey,
    ContentType: validatedData.fileType,
    Metadata: {
      'uploaded-by': currentUserId,
      'chat-id': validatedData.chatId,
      'original-filename': validatedData.fileName,
    },
  });
  
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
  
  // Create media record
  const media = await prisma.media.create({
    data: {
      fileName: validatedData.fileName,
      fileKey,
      fileType: validatedData.fileType,
      fileSize: validatedData.fileSize,
      uploadedBy: currentUserId,
      chatId: validatedData.chatId,
      status: 'uploading',
    },
  });
  
  logger.info('Presigned URL generated', { 
    mediaId: media.id,
    fileKey,
    uploadedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: {
      mediaId: media.id,
      uploadUrl: presignedUrl,
      fileKey,
      expiresIn: 3600,
    },
  });
}));

// POST /api/media/upload/complete
router.post('/upload/complete', asyncHandler(async (req, res) => {
  // TODO: Implement complete upload
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Complete upload endpoint not implemented yet',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
    },
  });
}));

// GET /api/media/:fileId
router.get('/:fileId', asyncHandler(async (req, res) => {
  // TODO: Implement get media file
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Get media file endpoint not implemented yet',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
    },
  });
}));

// POST /api/media/:mediaId/complete
router.post('/:mediaId/complete', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { mediaId } = req.params;
  
  // Get media record
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });
  
  if (!media) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MEDIA_NOT_FOUND',
        message: 'Media not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Verify ownership
  if (media.uploadedBy !== currentUserId) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You can only complete your own uploads',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Update media status
  const updatedMedia = await prisma.media.update({
    where: { id: mediaId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });
  
  logger.info('Media upload completed', { 
    mediaId,
    uploadedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: updatedMedia,
  });
}));

// POST /api/media/upload
router.post('/upload', authenticateToken, upload.single('file'), asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId } = req.body;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_PROVIDED',
        message: 'No file provided',
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
  
  // Generate unique file key
  const fileExtension = path.extname(req.file.originalname);
  const fileKey = `uploads/${chatId}/${currentUserId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
  
  // Upload to S3
  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileKey,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    Metadata: {
      'uploaded-by': currentUserId,
      'chat-id': chatId,
      'original-filename': req.file.originalname,
    },
  });
  
  await s3Client.send(uploadCommand);
  
  // Create media record
  const media = await prisma.media.create({
    data: {
      fileName: req.file.originalname,
      fileKey,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: currentUserId,
      chatId,
      status: 'completed',
      completedAt: new Date(),
    },
  });
  
  logger.info('File uploaded successfully', { 
    mediaId: media.id,
    fileKey,
    uploadedBy: currentUserId,
  });
  
  res.status(201).json({
    success: true,
    data: media,
  });
}));

// GET /api/media/:mediaId
router.get('/:mediaId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { mediaId } = req.params;
  
  // Get media record
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      chat: {
        include: {
          participants: {
            where: { userId: currentUserId, isActive: true },
          },
        },
      },
    },
  });
  
  if (!media) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MEDIA_NOT_FOUND',
        message: 'Media not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user is participant in chat
  if (media.chat.participants.length === 0) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have access to this media',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Generate download URL
  const downloadCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: media.fileKey,
  });
  
  const downloadUrl = await getSignedUrl(s3Client, downloadCommand, { expiresIn: 3600 });
  
  res.json({
    success: true,
    data: {
      ...media,
      downloadUrl,
    },
  });
}));

// POST /api/media/:mediaId/process
router.post('/:mediaId/process', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { mediaId } = req.params;
  const validatedData = processMediaSchema.parse(req.body);
  
  // Get media record
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });
  
  if (!media) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MEDIA_NOT_FOUND',
        message: 'Media not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user is participant in chat
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      chatId: media.chatId,
      userId: currentUserId,
      isActive: true,
    },
  });
  
  if (!participant) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have access to this media',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Update media status to processing
  await prisma.media.update({
    where: { id: mediaId },
    data: {
      status: 'processing',
      processingType: validatedData.processingType,
      processingOptions: validatedData.options,
    },
  });
  
  // TODO: Add to processing queue (Bull Queue)
  // For now, just return success
  
  logger.info('Media processing requested', { 
    mediaId,
    processingType: validatedData.processingType,
    requestedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: {
      message: 'Media processing started',
      mediaId,
      processingType: validatedData.processingType,
    },
  });
}));

// GET /api/media/chat/:chatId
router.get('/chat/:chatId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { chatId } = req.params;
  const { limit = 20, offset = 0, type } = req.query;
  
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
  
  // Build where clause
  const whereClause: any = {
    chatId,
    status: 'completed',
  };
  
  if (type) {
    whereClause.fileType = { startsWith: type as string };
  }
  
  // Get media files
  const mediaFiles = await prisma.media.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: Number(offset),
    include: {
      uploadedByUser: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
  });
  
  // Get total count
  const total = await prisma.media.count({
    where: whereClause,
  });
  
  res.json({
    success: true,
    data: {
      mediaFiles,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: total > Number(offset) + Number(limit),
      },
    },
  });
}));

// DELETE /api/media/:mediaId
router.delete('/:mediaId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { mediaId } = req.params;
  
  // Get media record
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });
  
  if (!media) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MEDIA_NOT_FOUND',
        message: 'Media not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user is the uploader or admin
  const isUploader = media.uploadedBy === currentUserId;
  const isAdmin = await prisma.chatParticipant.findFirst({
    where: {
      chatId: media.chatId,
      userId: currentUserId,
      role: 'admin',
      isActive: true,
    },
  });
  
  if (!isUploader && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You can only delete your own media or must be an admin',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Delete from S3
  const deleteCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: media.fileKey,
  });
  
  try {
    await s3Client.send(deleteCommand);
  } catch (error) {
    logger.error('Failed to delete file from S3', { error, mediaId });
  }
  
  // Delete from database
  await prisma.media.delete({
    where: { id: mediaId },
  });
  
  logger.info('Media deleted', { 
    mediaId,
    deletedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: {
      message: 'Media deleted successfully',
    },
  });
}));

export default router; 