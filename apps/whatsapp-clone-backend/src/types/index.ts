// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

// Authentication Types
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  profilePictureUrl?: string;
  status?: string;
  about?: string;
  lastSeen?: string;
  isOnline: boolean;
  isVerified: boolean;
  privacySettings: {
    lastSeen: boolean;
    profilePicture: boolean;
    status: boolean;
  };
  notificationSettings: {
    messages: boolean;
    calls: boolean;
    groups: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Chat Types
export interface ChatSummary {
  id: string;
  name?: string;
  type: 'INDIVIDUAL' | 'GROUP';
  avatarUrl?: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
    type: string;
  };
  unreadCount: number;
  participantCount: number;
  updatedAt: string;
}

export interface ChatDetails {
  id: string;
  name?: string;
  type: 'INDIVIDUAL' | 'GROUP';
  description?: string;
  avatarUrl?: string;
  participants: Array<{
    id: string;
    username?: string;
    profilePictureUrl?: string;
    role: 'ADMIN' | 'MEMBER' | 'MODERATOR';
    joinedAt: string;
    isOnline: boolean;
  }>;
  settings: {
    muteNotifications: boolean;
    pinChat: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface Message {
  id: string;
  chatId: string;
  sender?: {
    id: string;
    username?: string;
    profilePictureUrl?: string;
  };
  content?: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT' | 'STICKER';
  mediaUrl?: string;
  thumbnailUrl?: string;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  isEdited: boolean;
  isDeleted: boolean;
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  updatedAt: string;
}

// Media Types
export interface MediaFile {
  id: string;
  fileName: string;
  fileType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER';
  mimeType: string;
  fileSize: number;
  urls: {
    original: string;
    thumbnail?: string;
    compressed?: string;
    preview?: string;
  };
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
  };
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

// WebSocket Types
export interface SocketConnection {
  userId: string;
  socketId: string;
  userAgent: string;
  ipAddress: string;
  connectedAt: string;
}

export interface SocketAuth {
  token: string;
  userId: string;
}

// Error Types
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

export enum ErrorCodes {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // File upload errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  
  // Real-time errors
  WEBSOCKET_CONNECTION_FAILED = 'WEBSOCKET_CONNECTION_FAILED',
  MESSAGE_DELIVERY_FAILED = 'MESSAGE_DELIVERY_FAILED',
  
  // System errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

// Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CreateChatRequest {
  type: 'INDIVIDUAL' | 'GROUP';
  name?: string;
  description?: string;
  participantIds: string[];
}

export interface SendMessageRequest {
  content?: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT' | 'STICKER';
  replyToId?: string;
  mediaFile?: Express.Multer.File;
}

// Environment Types
export interface Environment {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  SENDGRID_API_KEY?: string;
} 