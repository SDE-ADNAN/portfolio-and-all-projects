import { Router } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// GET /api/messages/:chatId
router.get('/:chatId', asyncHandler(async (req, res) => {
  // TODO: Implement get messages
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Get messages endpoint not implemented yet',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
    },
  });
}));

// POST /api/messages/:chatId
router.post('/:chatId', asyncHandler(async (req, res) => {
  // TODO: Implement send message
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Send message endpoint not implemented yet',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
    },
  });
}));

export default router; 