import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';
import logger from '@/config/logger';
import emailService from '@/services/emailService';
import smsService from '@/services/smsService';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  phone: z.string().optional(),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

const verifyPhoneSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const resendVerificationSchema = z.object({
  type: z.enum(['email', 'phone']),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Helper functions
const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: validatedData.email },
        { username: validatedData.username },
      ],
    },
  });
  
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'USER_ALREADY_EXISTS',
        message: 'User with this email or username already exists',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      username: validatedData.username,
      phone: validatedData.phone,
      passwordHash,
      isVerified: false,
    },
    select: {
      id: true,
      email: true,
      username: true,
      isVerified: true,
      createdAt: true,
    },
  });
  
  // Send verification email
  await emailService.sendVerificationEmail(user.id, user.email, user.username);
  
  // Generate tokens
  const tokens = generateTokens(user.id, user.email);
  
  logger.info('User registered successfully', { userId: user.id, email: user.email });
  
  res.status(201).json({
    success: true,
    data: {
      user: {
        ...user,
        emailVerified: false,
        phoneVerified: false,
      },
      tokens,
      message: 'Please check your email for verification',
    },
  });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Update last seen
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeen: new Date() },
  });
  
  // Generate tokens
  const tokens = generateTokens(user.id, user.email);
  
  logger.info('User logged in successfully', { userId: user.id, email: user.email });
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
      },
      tokens,
    },
  });
}));

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const validatedData = refreshSchema.parse(req.body);
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(validatedData.refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isVerified: true,
      },
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }
    
    // Generate new tokens
    const tokens = generateTokens(user.id, user.email);
    
    logger.info('Token refreshed successfully', { userId: user.id });
    
    res.json({
      success: true,
      data: {
        tokens,
      },
    });
  } catch (error) {
    logger.error('Token refresh failed', { error });
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid refresh token',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
}));

// POST /api/auth/logout
router.post('/logout', asyncHandler(async (req, res) => {
  const validatedData = refreshSchema.parse(req.body);
  
  try {
    // Verify refresh token to get user info
    const decoded = jwt.verify(validatedData.refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    
    // In a production environment, you would add the refresh token to a blacklist
    // For now, we'll just return success
    
    logger.info('User logged out successfully', { userId: decoded.userId });
    
    res.json({
      success: true,
      data: {
        message: 'Successfully logged out',
      },
    });
  } catch (error) {
    logger.error('Logout failed', { error });
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid refresh token',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
}));

// POST /api/auth/verify-email
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_TOKEN',
        message: 'Verification token is required',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  try {
    // Verify email verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Update user verification status
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { isVerified: true },
    });
    
    logger.info('Email verified successfully', { userId: decoded.userId });
    
    res.json({
      success: true,
      data: {
        message: 'Email verified successfully',
      },
    });
  } catch (error) {
    logger.error('Email verification failed', { error });
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired verification token',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
}));

// POST /api/auth/forgot-password
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_EMAIL',
        message: 'Email is required',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.json({
      success: true,
      data: {
        message: 'If an account with this email exists, a password reset link has been sent',
      },
    });
  }
  
  // Generate password reset token
  const resetToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  
  // TODO: Send email with reset link
  // For now, just log the token
  logger.info('Password reset token generated', { 
    userId: user.id, 
    email: user.email,
    resetToken 
  });
  
  res.json({
    success: true,
    data: {
      message: 'If an account with this email exists, a password reset link has been sent',
    },
  });
}));

// POST /api/auth/reset-password
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Token and new password are required',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  try {
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash },
    });
    
    logger.info('Password reset successfully', { userId: decoded.userId });
    
    res.json({
      success: true,
      data: {
        message: 'Password reset successfully',
      },
    });
  } catch (error) {
    logger.error('Password reset failed', { error });
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
}));

// POST /api/auth/verify-email
router.post('/verify-email', asyncHandler(async (req, res) => {
  const validatedData = verifyEmailSchema.parse(req.body);
  
  const result = await emailService.verifyEmailToken(validatedData.token);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Invalid or expired verification token',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  logger.info('Email verified successfully', { userId: result.userId });
  
  res.json({
    success: true,
    data: {
      message: 'Email verified successfully',
    },
  });
}));

// POST /api/auth/verify-phone
router.post('/verify-phone', authenticateToken, asyncHandler(async (req, res) => {
  const validatedData = verifyPhoneSchema.parse(req.body);
  const userId = (req as any).user.id;
  
  const success = await smsService.verifyPhoneCode(userId, validatedData.code);
  
  if (!success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_OR_EXPIRED_CODE',
        message: 'Invalid or expired verification code',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  logger.info('Phone verified successfully', { userId });
  
  res.json({
    success: true,
    data: {
      message: 'Phone verified successfully',
    },
  });
}));

// POST /api/auth/send-phone-verification
router.post('/send-phone-verification', authenticateToken, asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  
  // Get user's phone number
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  
  if (!user?.phone) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_PHONE_NUMBER',
        message: 'No phone number associated with this account',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  const success = await smsService.sendVerificationSMS(userId, user.phone);
  
  if (!success) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SMS_SEND_FAILED',
        message: 'Failed to send verification SMS',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  logger.info('Phone verification SMS sent', { userId, phone: user.phone });
  
  res.json({
    success: true,
    data: {
      message: 'Verification SMS sent successfully',
    },
  });
}));

// POST /api/auth/resend-verification
router.post('/resend-verification', authenticateToken, asyncHandler(async (req, res) => {
  const validatedData = resendVerificationSchema.parse(req.body);
  const userId = (req as any).user.id;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, username: true, phone: true },
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
  
  let success = false;
  
  if (validatedData.type === 'email') {
    success = await emailService.sendVerificationEmail(userId, user.email, user.username);
  } else if (validatedData.type === 'phone' && user.phone) {
    success = await smsService.resendVerificationSMS(userId, user.phone);
  }
  
  if (!success) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_SEND_FAILED',
        message: `Failed to send ${validatedData.type} verification`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  logger.info(`${validatedData.type} verification resent`, { userId });
  
  res.json({
    success: true,
    data: {
      message: `${validatedData.type} verification sent successfully`,
    },
  });
}));

// POST /api/auth/request-password-reset
router.post('/request-password-reset', asyncHandler(async (req, res) => {
  const validatedData = requestPasswordResetSchema.parse(req.body);
  
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
    select: { id: true, email: true, username: true },
  });
  
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.json({
      success: true,
      data: {
        message: 'If an account with this email exists, a password reset link has been sent',
      },
    });
  }
  
  const success = await emailService.sendPasswordResetEmail(user.id, user.email, user.username);
  
  if (!success) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send password reset email',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  logger.info('Password reset email sent', { userId: user.id, email: user.email });
  
  res.json({
    success: true,
    data: {
      message: 'If an account with this email exists, a password reset link has been sent',
    },
  });
}));

// POST /api/auth/reset-password-with-token
router.post('/reset-password-with-token', asyncHandler(async (req, res) => {
  const validatedData = resetPasswordSchema.parse(req.body);
  
  const result = await emailService.verifyPasswordResetToken(validatedData.token);
  
  if (!result.success || !result.userId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Invalid or expired reset token',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
  
  // Hash new password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);
  
  // Update user password
  await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash },
  });
  
  // Invalidate the token
  await emailService.invalidatePasswordResetToken(validatedData.token);
  
  logger.info('Password reset successfully with token', { userId: result.userId });
  
  res.json({
    success: true,
    data: {
      message: 'Password reset successfully',
    },
  });
}));

export default router; 