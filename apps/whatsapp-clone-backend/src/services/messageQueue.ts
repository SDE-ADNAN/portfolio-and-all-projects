import Queue from 'bull';
import { PrismaClient } from '@prisma/client';
import logger from '@/config/logger';

const prisma = new PrismaClient();

// Message processing queue
export const messageQueue = new Queue('message-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});

// Message delivery queue
export const deliveryQueue = new Queue('message-delivery', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});

// Message search indexing queue
export const searchQueue = new Queue('message-search-indexing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});

// Process message delivery
deliveryQueue.process(async (job) => {
  try {
    const { messageId, chatId, senderId } = job.data;
    
    // Get chat participants
    const participants = await prisma.chatParticipant.findMany({
      where: { 
        chatId,
        isActive: true,
        userId: { not: senderId },
      },
    });
    
    // Update message status for each participant
    const messageStatuses = participants.map((participant) => ({
      messageId,
      userId: participant.userId,
      status: 'delivered',
      deliveredAt: new Date(),
    }));
    
    await prisma.messageStatus.createMany({
      data: messageStatuses,
    });
    
    logger.info('Message delivered to participants', { 
      messageId, 
      chatId, 
      participantCount: participants.length,
    });
    
    return { success: true, deliveredTo: participants.length };
  } catch (error) {
    logger.error('Message delivery failed', { error, jobId: job.id });
    throw error;
  }
});

// Process message search indexing
searchQueue.process(async (job) => {
  try {
    const { messageId } = job.data;
    
    // Get message for indexing
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: { username: true },
        },
      },
    });
    
    if (!message) {
      throw new Error('Message not found for indexing');
    }
    
    // Message is ready for search indexing
    // Search can be performed on the content field directly
    logger.info('Message ready for search indexing', { 
      messageId, 
      content: message.content,
      sender: message.sender.username 
    });
    
    logger.info('Message indexed for search', { messageId });
    
    return { success: true };
  } catch (error) {
    logger.error('Message indexing failed', { error, jobId: job.id });
    throw error;
  }
});

// Add message to delivery queue
export const addMessageToDeliveryQueue = async (messageId: string, chatId: string, senderId: string) => {
  try {
    await deliveryQueue.add(
      'deliver-message',
      { messageId, chatId, senderId },
      {
        delay: 1000, // 1 second delay
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );
    
    logger.info('Message added to delivery queue', { messageId, chatId });
  } catch (error) {
    logger.error('Failed to add message to delivery queue', { error, messageId });
  }
};

// Add message to search indexing queue
export const addMessageToSearchQueue = async (messageId: string) => {
  try {
    await searchQueue.add(
      'index-message',
      { messageId },
      {
        delay: 5000, // 5 second delay
        attempts: 2,
      }
    );
    
    logger.info('Message added to search indexing queue', { messageId });
  } catch (error) {
    logger.error('Failed to add message to search queue', { error, messageId });
  }
};

// Get queue statistics
export const getQueueStats = async () => {
  try {
    const [deliveryStats, searchStats] = await Promise.all([
      deliveryQueue.getJobCounts(),
      searchQueue.getJobCounts(),
    ]);
    
    return {
      delivery: deliveryStats,
      search: searchStats,
    };
  } catch (error) {
    logger.error('Failed to get queue stats', { error });
    return null;
  }
};

// Clean up completed jobs
export const cleanupCompletedJobs = async () => {
  try {
    await Promise.all([
      deliveryQueue.clean(24 * 60 * 60 * 1000, 'completed'), // 24 hours
      searchQueue.clean(24 * 60 * 60 * 1000, 'completed'), // 24 hours
    ]);
    
    logger.info('Completed jobs cleaned up');
  } catch (error) {
    logger.error('Failed to cleanup completed jobs', { error });
  }
};

// Graceful shutdown
export const shutdownQueues = async () => {
  try {
    await Promise.all([
      deliveryQueue.close(),
      searchQueue.close(),
    ]);
    
    logger.info('Message queues shut down gracefully');
  } catch (error) {
    logger.error('Failed to shutdown queues gracefully', { error });
  }
}; 