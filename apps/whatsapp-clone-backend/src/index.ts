import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Temporary require syntax for problematic imports
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');

// Load environment variables
dotenv.config();

// Import configurations
import logger from '@/config/logger';
import redisClient from '@/config/redis';

// Import middleware
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import chatRoutes from '@/routes/chats';
import messageRoutes from '@/routes/messages';
import mediaRoutes from '@/routes/media';

// Import WebSocket handlers
import { setupWebSocket } from '@/services/websocket';

const app = express();
const server = createServer(app);
const port = process.env['PORT'] || 3001;

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '1000'), // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
};

const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env['AUTH_RATE_LIMIT_MAX_REQUESTS'] || '5'), // 5 attempts per 15 minutes
  message: 'Too many authentication attempts',
};

const messageRateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env['MESSAGE_RATE_LIMIT_MAX_REQUESTS'] || '30'), // 30 messages per minute
  message: 'Message rate limit exceeded',
};

// Middleware
app.use(helmet());
app.use(compression() as any);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
app.use('/api/auth', rateLimit(authRateLimit));
app.use('/api/chats/*/messages', rateLimit(messageRateLimit));
app.use('/api', rateLimit(rateLimitConfig));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId,
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/media', mediaRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// WebSocket setup
const io = new Server(server, {
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
  },
  pingTimeout: parseInt(process.env['WS_HEARTBEAT_TIMEOUT'] || '60000'),
  pingInterval: parseInt(process.env['WS_HEARTBEAT_INTERVAL'] || '25000'),
});

// Redis adapter for Socket.IO
const setupRedisAdapter = async () => {
  try {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    
    await Promise.all([
      pubClient.connect(),
      subClient.connect()
    ]);
    
    io.adapter(createAdapter(pubClient, subClient) as any);
    logger.info('Redis adapter connected successfully');
  } catch (error) {
    logger.error('Failed to setup Redis adapter:', error);
  }
};

// Setup WebSocket handlers
setupWebSocket(io);

// Setup Redis adapter
setupRedisAdapter();

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await redisClient.quit();
      logger.info('Redis client closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing Redis client:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server.listen(port, () => {
  logger.info(`🚀 WhatsApp Clone Backend server running on port ${port}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Health check: http://localhost:${port}/health`);
});

export default app;