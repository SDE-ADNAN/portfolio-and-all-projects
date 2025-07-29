import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';
import logger from '@/config/logger';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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
  mediaFileId: z.string().uuid('Invalid media file ID'),
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
  
  // Create media file record
  const mediaFile = await prisma.mediaFile.create({
    data: {
      fileName: validatedData.fileName,
      fileType: path.extname(validatedData.fileName).substring(1),
      mimeType: validatedData.fileType,
      fileSize: BigInt(validatedData.fileSize),
      originalUrl: fileKey,
      processingStatus: 'PENDING',
    },
  });
  
  logger.info('Presigned URL generated', { 
    mediaFileId: mediaFile.id,
    fileKey,
    uploadedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: {
      mediaFileId: mediaFile.id,
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

// POST /api/media/:mediaFileId/complete
router.post('/:mediaFileId/complete', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { mediaFileId } = req.params;
  
  // Get media file record
  const mediaFile = await prisma.mediaFile.findUnique({
    where: { id: mediaFileId },
  });
  
  if (!mediaFile) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MEDIA_FILE_NOT_FOUND',
        message: 'Media file not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Update media file status
  const updatedMediaFile = await prisma.mediaFile.update({
    where: { id: mediaFileId },
    data: {
      processingStatus: 'COMPLETED',
    },
  });
  
  logger.info('Media file upload completed', { 
    mediaFileId,
    uploadedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: updatedMediaFile,
  });
}));

// POST /api/media/upload
(router as any).post('/upload', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
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
  
  // Create media file record
  const mediaFile = await prisma.mediaFile.create({
    data: {
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).substring(1),
      mimeType: req.file.mimetype,
      fileSize: BigInt(req.file.size),
      originalUrl: fileKey,
      processingStatus: 'COMPLETED',
    },
  });
  
  logger.info('File uploaded successfully', { 
    mediaFileId: mediaFile.id,
    fileKey,
    uploadedBy: currentUserId,
  });
  
  res.status(201).json({
    success: true,
    data: mediaFile,
  });
  } catch (error) {
    next(error);
  }
});

// GET /api/media/:mediaFileId
router.get('/:mediaFileId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { mediaFileId } = req.params;
  
  // Get media file record
  const mediaFile = await prisma.mediaFile.findUnique({
    where: { id: mediaFileId },
    include: {
      message: {
        include: {
          chat: {
            include: {
              participants: {
                where: { userId: currentUserId, isActive: true },
              },
            },
          },
        },
      },
    },
  });
  
  if (!mediaFile) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MEDIA_FILE_NOT_FOUND',
        message: 'Media file not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user has access to the message/chat
  if (mediaFile.message && mediaFile.message.chat.participants.length === 0) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have access to this media file',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Generate download URL
  const downloadCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: mediaFile.originalUrl,
  });
  
  const downloadUrl = await getSignedUrl(s3Client, downloadCommand, { expiresIn: 3600 });
  
  res.json({
    success: true,
    data: {
      ...mediaFile,
      downloadUrl,
    },
  });
}));

// POST /api/media/:mediaFileId/process
router.post('/:mediaFileId/process', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { mediaFileId } = req.params;
  const validatedData = processMediaSchema.parse(req.body);
  
  // Get media file record
  const mediaFile = await prisma.mediaFile.findUnique({
    where: { id: mediaFileId },
    include: {
      message: {
        include: {
          chat: {
            include: {
              participants: {
                where: { userId: currentUserId, isActive: true },
              },
            },
          },
        },
      },
    },
  });
  
  if (!mediaFile) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MEDIA_FILE_NOT_FOUND',
        message: 'Media file not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user has access to the message/chat
  if (mediaFile.message && mediaFile.message.chat.participants.length === 0) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have access to this media file',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Create processing job
  const processingJob = await prisma.fileProcessingJob.create({
    data: {
      mediaFileId,
      jobType: validatedData.processingType,
      status: 'PENDING',
      inputData: JSON.stringify(validatedData.options || {}),
    },
  });
  
  // Update media file status to processing
  await prisma.mediaFile.update({
    where: { id: mediaFileId },
    data: {
      processingStatus: 'PROCESSING',
    },
  });
  
  logger.info('Media file processing requested', { 
    mediaFileId,
    processingType: validatedData.processingType,
    requestedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: {
      message: 'Media file processing started',
      mediaFileId,
      processingJobId: processingJob.id,
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
    message: {
      chatId,
    },
    processingStatus: 'COMPLETED',
  };
  
  if (type) {
    whereClause.mimeType = { startsWith: type as string };
  }
  
  // Get media files
  const mediaFiles = await prisma.mediaFile.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: Number(offset),
    include: {
      message: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              profilePictureUrl: true,
            },
          },
        },
      },
    },
  });
  
  // Get total count
  const total = await prisma.mediaFile.count({
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

// DELETE /api/media/:mediaFileId
router.delete('/:mediaFileId', authenticateToken, asyncHandler(async (req, res) => {
  const currentUserId = req.user!.userId;
  const { mediaFileId } = req.params;
  
  // Get media file record
  const mediaFile = await prisma.mediaFile.findUnique({
    where: { id: mediaFileId },
    include: {
      message: {
        include: {
          chat: {
            include: {
              participants: {
                where: { userId: currentUserId },
              },
            },
          },
        },
      },
    },
  });
  
  if (!mediaFile) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MEDIA_FILE_NOT_FOUND',
        message: 'Media file not found',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user can delete the media file
  const isMessageSender = mediaFile.message?.senderId === currentUserId;
  const isAdmin = mediaFile.message?.chat.participants.some(p => p.role === 'admin');
  
  if (!isMessageSender && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You can only delete your own media files or must be an admin',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Delete from S3
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: mediaFile.originalUrl,
  });
  
  try {
    await s3Client.send(deleteCommand);
  } catch (error) {
    logger.error('Failed to delete file from S3', { error, mediaFileId });
  }
  
  // Delete from database
  await prisma.mediaFile.delete({
    where: { id: mediaFileId },
  });
  
  logger.info('Media file deleted', { 
    mediaFileId,
    deletedBy: currentUserId,
  });
  
  res.json({
    success: true,
    data: {
      message: 'Media file deleted successfully',
    },
  });
}));

export default router; 