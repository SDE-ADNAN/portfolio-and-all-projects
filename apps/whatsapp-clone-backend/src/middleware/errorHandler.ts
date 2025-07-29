import { Request, Response, NextFunction } from 'express';
import { ErrorCodes } from '@/types';
import logger from '@/config/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const errorId = generateErrorId();
  
  // Log error with context
  logger.error('API Error', {
    errorId,
    error: err,
    request: {
      method: req.method,
      url: req.url,
      userId: req.user?.userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });
  
  // Determine error type
  let statusCode = 500;
  let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = 'Validation failed';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = ErrorCodes.UNAUTHORIZED;
    message = 'Authentication required';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = ErrorCodes.RESOURCE_NOT_FOUND;
    message = 'Resource not found';
  } else if (err.name === 'RateLimitError') {
    statusCode = 429;
    errorCode = ErrorCodes.RATE_LIMIT_EXCEEDED;
    message = 'Too many requests';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    errorCode = (err.code as ErrorCodes) || ErrorCodes.INTERNAL_SERVER_ERROR;
    message = err.message;
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details: err.details || null,
      timestamp: new Date().toISOString(),
      requestId: errorId,
    },
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCodes.RESOURCE_NOT_FOUND,
      message: `Route ${req.method} ${req.url} not found`,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
    },
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}; 