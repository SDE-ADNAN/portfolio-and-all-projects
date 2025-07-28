import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(50),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
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

const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  },
  body: JSON.stringify(body),
});

// Lambda function for user registration
export const register = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const validatedData = registerSchema.parse(body);
    
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
      return createResponse(400, {
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'User with this email or username already exists',
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
    
    // Generate tokens
    const tokens = generateTokens(user.id, user.email);
    
    return createResponse(201, {
      success: true,
      data: {
        user,
        tokens,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return createResponse(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
    }
    
    return createResponse(500, {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
};

// Lambda function for user login
export const login = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const validatedData = loginSchema.parse(body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (!user) {
      return createResponse(401, {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
    
    if (!isPasswordValid) {
      return createResponse(401, {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
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
    
    return createResponse(200, {
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
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return createResponse(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
    }
    
    return createResponse(500, {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
};

// Lambda function for token refresh
export const refresh = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const validatedData = refreshSchema.parse(body);
    
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
      return createResponse(401, {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        },
      });
    }
    
    // Generate new tokens
    const tokens = generateTokens(user.id, user.email);
    
    return createResponse(200, {
      success: true,
      data: {
        tokens,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return createResponse(401, {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        },
      });
    }
    
    if (error instanceof z.ZodError) {
      return createResponse(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
    }
    
    return createResponse(500, {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
};

// Lambda function for logout
export const logout = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const validatedData = refreshSchema.parse(body);
    
    // In a production environment, you would add the refresh token to a blacklist
    // For now, we'll just return success
    
    return createResponse(200, {
      success: true,
      data: {
        message: 'Successfully logged out',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    if (error instanceof z.ZodError) {
      return createResponse(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
    }
    
    return createResponse(500, {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}; 