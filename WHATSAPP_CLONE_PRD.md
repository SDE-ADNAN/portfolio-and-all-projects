# 📱 WhatsApp Clone - Product Requirements Document (PRD)

## **🎯 Executive Summary**

### **Project Overview**
A high-performance, scalable WhatsApp clone built with Next.js frontend, Express.js backend, PostgreSQL (Neon DB), and WebSocket connections. This project demonstrates advanced system design, real-time messaging, and enterprise-level architecture.

### **Business Objectives**
- Showcase full-stack development capabilities
- Demonstrate real-time application architecture
- Implement advanced performance optimizations
- Create a production-ready messaging platform
- Showcase modern development practices and system design

### **Success Metrics**
- Sub-100ms message delivery latency
- 99.9% uptime for messaging services
- Support for 10,000+ concurrent users
- Lighthouse performance score >95
- Real-time message synchronization across devices

---

## **🏗️ System Architecture**

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Express API   │    │   WebSocket     │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   Server        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Redis Cache   │    │   Message Queue │
│   (Neon DB)     │    │   (Session)     │    │   (Bull/Redis)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Technology Stack**

#### **Frontend (Next.js 14)**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand + React Query
- **Real-time**: Socket.io Client
- **UI Components**: Radix UI, Framer Motion
- **Performance**: React.memo, useMemo, useCallback

#### **Backend (Express.js)**
- **Framework**: Express.js with TypeScript
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Prisma
- **Authentication**: JWT + Refresh Tokens
- **Validation**: Zod
- **Rate Limiting**: Express Rate Limit
- **Security**: Helmet, CORS, bcrypt

#### **Real-time Infrastructure**
- **WebSocket**: Socket.io
- **Message Queue**: Bull Queue + Redis
- **Caching**: Redis
- **Session Management**: Redis + JWT

#### **Database & Storage**
- **Primary DB**: PostgreSQL (Neon DB)
- **Caching**: Redis
- **File Storage**: AWS S3 with CloudFront CDN
- **Image Processing**: Sharp.js for server-side optimization
- **Video Processing**: FFmpeg for compression and thumbnails
- **Audio Processing**: Audio compression and waveform generation

#### **DevOps & Monitoring**
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Performance**: Lighthouse, Core Web Vitals

---

## **📋 Functional Requirements**

### **1. User Authentication & Management**

#### **1.1 User Registration**
- **Email/Password registration**
- **Phone number verification** (SMS via Twilio)
- **Profile picture upload** (AWS S3)
- **Username generation** (unique handles)
- **Email verification** (SendGrid)

#### **1.2 User Authentication**
- **JWT-based authentication**
- **Refresh token rotation**
- **Remember me functionality**
- **Multi-device login support**
- **Session management**

#### **1.3 User Profile**
- **Profile picture management**
- **Status/About updates**
- **Last seen functionality**
- **Privacy settings**
- **Block/Unblock users**

### **2. Contact Management**

#### **2.1 Contact Discovery**
- **Phone number sync** (with permission)
- **Username search**
- **QR code sharing**
- **Contact import/export**

#### **2.2 Contact Management**
- **Add/Remove contacts**
- **Contact favorites**
- **Contact groups**
- **Contact notes**

### **3. Messaging System**

#### **3.1 Real-time Messaging**
- **Instant message delivery** (<100ms)
- **Message status indicators** (sent, delivered, read)
- **Typing indicators**
- **Online/Offline status**
- **Message synchronization** across devices

#### **3.2 Message Types**
- **Text messages**
- **Image messages** (with compression)
- **Video messages** (with thumbnail generation)
- **Audio messages** (voice notes)
- **Document sharing** (PDF, DOC, etc.)
- **Location sharing**
- **Contact sharing**

#### **3.3 Message Features**
- **Message reactions** (emojis)
- **Message replies**
- **Message forwarding**
- **Message deletion** (for everyone)
- **Message editing**
- **Message search**

### **4. Chat Management**

#### **4.1 Individual Chats**
- **One-on-one messaging**
- **Message history**
- **Media gallery**
- **Chat search**
- **Chat backup**

#### **4.2 Group Chats**
- **Group creation** (up to 256 members)
- **Group admin management**
- **Group settings**
- **Group invite links**
- **Group description**

### **5. Media Management**

#### **5.1 File Upload Architecture**

##### **Upload Flow**
```
Client → API Gateway → Lambda → S3 → CloudFront → Client
```

##### **File Types & Processing**
- **Images**: WebP compression, multiple sizes (thumbnail, medium, large)
- **Videos**: H.264 compression, thumbnail generation, multiple qualities
- **Audio**: Opus compression, waveform generation
- **Documents**: PDF preview generation, secure storage
- **Progressive loading** with lazy loading
- **Upload progress indicators** with real-time feedback

##### **Security & Validation**
- **File type validation** (MIME type checking)
- **File size limits** (configurable per type)
- **Virus scanning** (AWS Lambda with ClamAV)
- **Signed URLs** for secure uploads
- **Access control** with IAM policies

#### **5.2 Media Gallery**
- **Photo/video gallery**
- **Document library**
- **Media search**
- **Media download**

---

## **⚡ Performance Requirements**

### **1. Response Times**
- **Message delivery**: <100ms
- **API response**: <200ms
- **Page load**: <2 seconds
- **Image load**: <1 second
- **Search results**: <500ms

### **2. Scalability**
- **Concurrent users**: 10,000+
- **Messages per second**: 1,000+
- **Database connections**: 100+
- **WebSocket connections**: 5,000+

### **3. Availability**
- **Uptime**: 99.9%
- **Message delivery**: 99.99%
- **Data consistency**: 99.9%

### **4. Storage**
- **Message retention**: 7 years
- **Media storage**: Unlimited (with compression)
- **User data**: Encrypted at rest

---

## **🔒 Security Requirements**

### **1. Data Protection**
- **End-to-end encryption** (optional)
- **TLS/SSL encryption** (required)
- **Data encryption at rest**
- **Secure file uploads**
- **Input validation and sanitization**

### **2. Authentication Security**
- **Password hashing** (bcrypt)
- **JWT token security**
- **Rate limiting**
- **Brute force protection**
- **Session management**

### **3. Privacy**
- **GDPR compliance**
- **Data retention policies**
- **User data export**
- **Account deletion**
- **Privacy settings**

---

## **📁 File Upload Architecture**

### **1. AWS S3 Storage Strategy**

#### **1.1 Bucket Structure**
```
whatsapp-clone-media/
├── users/
│   ├── {user-id}/
│   │   ├── profile-pictures/
│   │   └── documents/
├── chats/
│   ├── {chat-id}/
│   │   ├── images/
│   │   ├── videos/
│   │   ├── audio/
│   │   └── documents/
├── temp/
│   └── uploads/
└── processed/
    ├── thumbnails/
    ├── compressed/
    └── previews/
```

#### **1.2 File Processing Pipeline**
```typescript
interface FileUploadConfig {
  maxSize: {
    image: 10 * 1024 * 1024,    // 10MB
    video: 100 * 1024 * 1024,   // 100MB
    audio: 50 * 1024 * 1024,    // 50MB
    document: 25 * 1024 * 1024  // 25MB
  };
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };
  compression: {
    image: { quality: 80, format: 'webp' },
    video: { codec: 'h264', bitrate: '1M' },
    audio: { codec: 'opus', bitrate: '128k' }
  };
}
```

#### **1.3 Upload Flow Architecture**
```typescript
// 1. Client requests upload URL
POST /api/upload/presigned-url
{
  "fileType": "image",
  "fileName": "photo.jpg",
  "fileSize": 5242880
}

// 2. Server generates presigned URL
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "fileKey": "chats/123/images/photo_123456.jpg",
  "expiresIn": 3600
}

// 3. Client uploads directly to S3
PUT {uploadUrl}
Content-Type: image/jpeg
Body: file-bytes

// 4. S3 triggers Lambda for processing
// 5. Lambda processes and creates multiple versions
// 6. Lambda updates database with file URLs
```

### **2. File Processing Services**

#### **2.1 Image Processing (Sharp.js)**
```typescript
interface ImageProcessingJob {
  originalKey: string;
  sizes: {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 }
  };
  formats: ['webp', 'jpeg'];
  quality: 80;
}

// Processing pipeline
const processImage = async (inputBuffer: Buffer, config: ImageProcessingJob) => {
  const sharp = require('sharp');
  
  // Generate multiple sizes and formats
  const processed = await Promise.all(
    Object.entries(config.sizes).map(async ([size, dimensions]) => {
      const processedBuffer = await sharp(inputBuffer)
        .resize(dimensions.width, dimensions.height, { fit: 'cover' })
        .webp({ quality: config.quality })
        .toBuffer();
      
      return { size, buffer: processedBuffer };
    })
  );
  
  return processed;
};
```

#### **2.2 Video Processing (FFmpeg)**
```typescript
interface VideoProcessingJob {
  originalKey: string;
  qualities: {
    low: { resolution: '480p', bitrate: '500k' },
    medium: { resolution: '720p', bitrate: '1M' },
    high: { resolution: '1080p', bitrate: '2M' }
  };
  thumbnail: { width: 320, height: 180 };
}

// Video processing with FFmpeg
const processVideo = async (inputPath: string, config: VideoProcessingJob) => {
  const ffmpeg = require('fluent-ffmpeg');
  
  // Generate multiple qualities
  const qualities = await Promise.all(
    Object.entries(config.qualities).map(async ([quality, settings]) => {
      const outputPath = `${inputPath}_${quality}.mp4`;
      
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            `-c:v libx264`,
            `-b:v ${settings.bitrate}`,
            `-s ${settings.resolution}`,
            `-c:a aac`,
            `-b:a 128k`
          ])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
      
      return { quality, path: outputPath };
    })
  );
  
  // Generate thumbnail
  const thumbnailPath = await generateThumbnail(inputPath, config.thumbnail);
  
  return { qualities, thumbnail: thumbnailPath };
};
```

#### **2.3 Audio Processing**
```typescript
interface AudioProcessingJob {
  originalKey: string;
  compression: {
    codec: 'opus';
    bitrate: '128k';
    sampleRate: 48000;
  };
  waveform: {
    width: 300;
    height: 60;
    color: '#4CAF50';
  };
}

// Audio processing and waveform generation
const processAudio = async (inputPath: string, config: AudioProcessingJob) => {
  const ffmpeg = require('fluent-ffmpeg');
  const { generateWaveform } = require('./waveform-generator');
  
  // Compress audio
  const compressedPath = await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        `-c:a libopus`,
        `-b:a ${config.compression.bitrate}`,
        `-ar ${config.compression.sampleRate}`
      ])
      .output(`${inputPath}_compressed.opus`)
      .on('end', () => resolve(`${inputPath}_compressed.opus`))
      .on('error', reject)
      .run();
  });
  
  // Generate waveform
  const waveformData = await generateWaveform(inputPath, config.waveform);
  
  return { compressedPath, waveformData };
};
```

### **3. Security & Access Control**

#### **3.1 S3 Bucket Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::whatsapp-clone-media/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/ABCDEF123456"
        }
      }
    },
    {
      "Sid": "DenyUnencryptedObjectUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::whatsapp-clone-media/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

#### **3.2 CORS Configuration**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://whatsapp-clone.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### **4. Performance Optimization**

#### **4.1 CloudFront Distribution**
```typescript
interface CloudFrontConfig {
  distribution: {
    origins: {
      s3: {
        domainName: 'whatsapp-clone-media.s3.amazonaws.com',
        originAccessIdentity: 'E1234567890123'
      }
    };
    cacheBehaviors: {
      images: {
        pathPattern: '/images/*',
        ttl: 86400, // 24 hours
        compress: true
      };
      videos: {
        pathPattern: '/videos/*',
        ttl: 604800, // 7 days
        compress: false
      };
      documents: {
        pathPattern: '/documents/*',
        ttl: 3600, // 1 hour
        compress: true
      }
    };
  };
}
```

#### **4.2 Upload Optimization**
```typescript
// Chunked upload for large files
const uploadLargeFile = async (file: File, chunkSize: number = 5 * 1024 * 1024) => {
  const chunks = Math.ceil(file.size / chunkSize);
  const uploadId = await initiateMultipartUpload(file.name);
  
  const parts = await Promise.all(
    Array.from({ length: chunks }, async (_, index) => {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const partNumber = index + 1;
      const { ETag } = await uploadPart(uploadId, partNumber, chunk);
      
      return { PartNumber: partNumber, ETag };
    })
  );
  
  return await completeMultipartUpload(uploadId, parts);
};
```

### **5. Database Schema for Media**

#### **5.1 Media Files Table**
```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type ENUM('image', 'video', 'audio', 'document') NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,
  compressed_url TEXT,
  duration INTEGER, -- for video/audio in seconds
  width INTEGER, -- for images/videos
  height INTEGER, -- for images/videos
  metadata JSONB, -- additional file metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_media_files_message_id ON media_files(message_id);
CREATE INDEX idx_media_files_file_type ON media_files(file_type);
CREATE INDEX idx_media_files_created_at ON media_files(created_at);
```

#### **5.2 File Processing Jobs Table**
```sql
CREATE TABLE file_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  job_type ENUM('image_processing', 'video_processing', 'audio_processing') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  input_data JSONB NOT NULL,
  output_data JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_file_processing_jobs_status ON file_processing_jobs(status);
CREATE INDEX idx_file_processing_jobs_media_file_id ON file_processing_jobs(media_file_id);
```

### **6. API Endpoints for File Management**

#### **6.1 Upload Endpoints**
```typescript
// Get presigned URL for upload
POST /api/upload/presigned-url
{
  "fileType": "image|video|audio|document",
  "fileName": "photo.jpg",
  "fileSize": 5242880,
  "chatId": "uuid"
}

// Complete upload and trigger processing
POST /api/upload/complete
{
  "fileKey": "chats/123/images/photo_123456.jpg",
  "messageId": "uuid",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "duration": 30
  }
}

// Get file info
GET /api/media/:fileId
Response: {
  "id": "uuid",
  "fileName": "photo.jpg",
  "fileType": "image",
  "urls": {
    "original": "https://cdn.example.com/original.jpg",
    "thumbnail": "https://cdn.example.com/thumbnail.jpg",
    "compressed": "https://cdn.example.com/compressed.jpg"
  },
  "metadata": { ... }
}
```

#### **6.2 Processing Status**
```typescript
// Get processing status
GET /api/media/:fileId/status
Response: {
  "status": "processing|completed|failed",
  "progress": 75,
  "estimatedTime": 30,
  "error": null
}

// Cancel processing
DELETE /api/media/:fileId/processing
```

### **7. Error Handling & Monitoring**

#### **7.1 Upload Error Handling**
```typescript
interface UploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_FILE_TYPE' | 'UPLOAD_FAILED' | 'PROCESSING_FAILED';
  message: string;
  details?: any;
}

const handleUploadError = (error: UploadError) => {
  switch (error.code) {
    case 'FILE_TOO_LARGE':
      return { message: 'File size exceeds limit', retry: false };
    case 'INVALID_FILE_TYPE':
      return { message: 'File type not supported', retry: false };
    case 'UPLOAD_FAILED':
      return { message: 'Upload failed, please try again', retry: true };
    case 'PROCESSING_FAILED':
      return { message: 'File processing failed', retry: true };
  }
};
```

#### **7.2 Monitoring & Analytics**
```typescript
interface FileUploadMetrics {
  uploadCount: number;
  uploadSize: number;
  processingTime: number;
  errorRate: number;
  fileTypeDistribution: Record<string, number>;
}

// Track upload metrics
const trackUploadMetrics = (metrics: FileUploadMetrics) => {
  // Send to monitoring service (CloudWatch, DataDog, etc.)
  console.log('Upload metrics:', metrics);
};
```

This comprehensive file upload architecture provides:
- **Secure uploads** with presigned URLs
- **Multi-format processing** for different file types
- **CDN optimization** with CloudFront
- **Error handling** and retry mechanisms
- **Performance monitoring** and analytics
- **Scalable storage** with S3
- **Database tracking** of all media files

## **📊 Database Design & Schema Architecture**

### **1. Core Tables with Advanced Relationships**

#### **1.1 Users Table (Enhanced)**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture_url TEXT,
  status TEXT,
  about TEXT,
  last_seen TIMESTAMP,
  is_online BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  privacy_settings JSONB DEFAULT '{"last_seen": true, "profile_picture": true, "status": true}',
  notification_settings JSONB DEFAULT '{"messages": true, "calls": true, "groups": true}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Full-text search index
  CONSTRAINT users_search_idx GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(username, '') || ' ' || COALESCE(status, '') || ' ' || COALESCE(about, ''))
  ) STORED
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **1.2 Enhanced Chats Table**
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type ENUM('individual', 'group') NOT NULL,
  name VARCHAR(255),
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{"mute_notifications": false, "pin_chat": false}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **1.3 Enhanced Chat_Participants Table**
```sql
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role ENUM('admin', 'member', 'moderator') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB DEFAULT '{"send_messages": true, "edit_info": false, "remove_members": false}',
  notification_settings JSONB DEFAULT '{"mute": false, "mute_until": null}',
  
  UNIQUE(chat_id, user_id),
  
  -- Ensure only one admin per individual chat
  CONSTRAINT individual_chat_admin_check CHECK (
    (SELECT type FROM chats WHERE id = chat_id) != 'individual' OR role != 'admin' OR
    (SELECT COUNT(*) FROM chat_participants cp2 
     WHERE cp2.chat_id = chat_id AND cp2.role = 'admin') <= 1
  )
);

-- Index for active participants
CREATE INDEX idx_chat_participants_active ON chat_participants(chat_id, is_active) WHERE is_active = TRUE;
```

#### **1.4 Enhanced Messages Table**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  message_type ENUM('text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker') DEFAULT 'text',
  media_url TEXT,
  reply_to_id UUID REFERENCES messages(id),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_for_everyone BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Full-text search for message content
  CONSTRAINT messages_search_idx GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(content, ''))
  ) STORED
);

-- Trigger for updated_at
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **1.5 Enhanced Message_Status Table**
```sql
CREATE TABLE message_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
  read_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(message_id, user_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_message_status_updated_at BEFORE UPDATE ON message_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **1.6 Message Reactions Table**
```sql
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(message_id, user_id, emoji)
);
```

#### **1.7 User Relationships Table**
```sql
CREATE TABLE user_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship_type ENUM('contact', 'blocked', 'favorite') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, related_user_id, relationship_type)
);
```

#### **1.8 Enhanced Media Files Table**
```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type ENUM('image', 'video', 'audio', 'document', 'sticker') NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,
  compressed_url TEXT,
  preview_url TEXT,
  duration INTEGER, -- for video/audio in seconds
  width INTEGER, -- for images/videos
  height INTEGER, -- for images/videos
  metadata JSONB DEFAULT '{}',
  processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON media_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **2. Advanced Indexes for Performance**

#### **2.1 Primary Indexes**
```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_online ON users(is_online) WHERE is_online = TRUE;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Messages table indexes
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at);
CREATE INDEX idx_messages_type ON messages(message_type);
CREATE INDEX idx_messages_deleted ON messages(is_deleted) WHERE is_deleted = TRUE;

-- Message status indexes
CREATE INDEX idx_message_status_message_id ON message_status(message_id);
CREATE INDEX idx_message_status_user_id ON message_status(user_id);
CREATE INDEX idx_message_status_status ON message_status(status);

-- Chat participants indexes
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_participants_role ON chat_participants(role);

-- Media files indexes
CREATE INDEX idx_media_files_message_id ON media_files(message_id);
CREATE INDEX idx_media_files_file_type ON media_files(file_type);
CREATE INDEX idx_media_files_processing_status ON media_files(processing_status);
```

#### **2.2 Composite Indexes for Complex Queries**
```sql
-- For chat history with pagination
CREATE INDEX idx_messages_chat_created_desc ON messages(chat_id, created_at DESC);

-- For user's active chats
CREATE INDEX idx_chat_participants_user_active ON chat_participants(user_id, is_active) WHERE is_active = TRUE;

-- For message search
CREATE INDEX idx_messages_content_gin ON messages USING gin(to_tsvector('english', content));

-- For user search
CREATE INDEX idx_users_search_gin ON users USING gin(users_search_idx);
```

#### **2.3 Partial Indexes for Performance**
```sql
-- Only index non-deleted messages
CREATE INDEX idx_messages_active ON messages(chat_id, created_at) WHERE is_deleted = FALSE;

-- Only index online users
CREATE INDEX idx_users_online_status ON users(id, last_seen) WHERE is_online = TRUE;

-- Only index unread messages
CREATE INDEX idx_message_status_unread ON message_status(message_id, user_id) WHERE status != 'read';
```

### **3. Database Views for Common Queries**

#### **3.1 Chat Summary View**
```sql
CREATE VIEW chat_summary AS
SELECT 
  c.id as chat_id,
  c.name as chat_name,
  c.type as chat_type,
  c.avatar_url,
  c.created_at,
  c.updated_at,
  COUNT(cp.user_id) as participant_count,
  MAX(m.created_at) as last_message_at,
  (
    SELECT m2.content 
    FROM messages m2 
    WHERE m2.chat_id = c.id 
    AND m2.is_deleted = FALSE
    ORDER BY m2.created_at DESC 
    LIMIT 1
  ) as last_message_content,
  (
    SELECT u.username 
    FROM messages m3 
    JOIN users u ON m3.sender_id = u.id 
    WHERE m3.chat_id = c.id 
    AND m3.is_deleted = FALSE
    ORDER BY m3.created_at DESC 
    LIMIT 1
  ) as last_message_sender
FROM chats c
LEFT JOIN chat_participants cp ON c.id = cp.chat_id AND cp.is_active = TRUE
LEFT JOIN messages m ON c.id = m.chat_id AND m.is_deleted = FALSE
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.type, c.avatar_url, c.created_at, c.updated_at;
```

#### **3.2 User Chat List View**
```sql
CREATE VIEW user_chat_list AS
SELECT 
  c.id as chat_id,
  c.name as chat_name,
  c.type as chat_type,
  c.avatar_url,
  cp.role as user_role,
  cp.joined_at,
  cp.notification_settings,
  cs.participant_count,
  cs.last_message_at,
  cs.last_message_content,
  cs.last_message_sender,
  (
    SELECT COUNT(*) 
    FROM messages m 
    WHERE m.chat_id = c.id 
    AND m.created_at > COALESCE(ms.read_at, '1970-01-01')
    AND m.sender_id != cp.user_id
    AND m.is_deleted = FALSE
  ) as unread_count
FROM chat_participants cp
JOIN chats c ON cp.chat_id = c.id
JOIN chat_summary cs ON c.id = cs.chat_id
LEFT JOIN (
  SELECT 
    message_id,
    MAX(read_at) as read_at
  FROM message_status 
  WHERE user_id = cp.user_id
  GROUP BY message_id
) ms ON ms.message_id = (
  SELECT id FROM messages 
  WHERE chat_id = c.id 
  ORDER BY created_at DESC 
  LIMIT 1
)
WHERE cp.user_id = $1 AND cp.is_active = TRUE AND c.is_active = TRUE;
```

### **4. Database Functions for Complex Operations**

#### **4.1 Message Search Function**
```sql
CREATE OR REPLACE FUNCTION search_messages(
  user_id UUID,
  search_term TEXT,
  chat_id UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  message_id UUID,
  chat_id UUID,
  sender_id UUID,
  content TEXT,
  message_type TEXT,
  created_at TIMESTAMP,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.chat_id,
    m.sender_id,
    m.content,
    m.message_type::TEXT,
    m.created_at,
    ts_rank(m.messages_search_idx, plainto_tsquery('english', search_term)) as relevance
  FROM messages m
  JOIN chat_participants cp ON m.chat_id = cp.chat_id
  WHERE cp.user_id = search_messages.user_id
    AND cp.is_active = TRUE
    AND m.is_deleted = FALSE
    AND (chat_id IS NULL OR m.chat_id = search_messages.chat_id)
    AND m.messages_search_idx @@ plainto_tsquery('english', search_term)
  ORDER BY relevance DESC, m.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

#### **4.2 User Activity Function**
```sql
CREATE OR REPLACE FUNCTION get_user_activity(user_id UUID, days INTEGER DEFAULT 7)
RETURNS TABLE (
  date DATE,
  messages_sent INTEGER,
  messages_received INTEGER,
  chats_active INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(m.created_at) as date,
    COUNT(CASE WHEN m.sender_id = get_user_activity.user_id THEN 1 END) as messages_sent,
    COUNT(CASE WHEN m.sender_id != get_user_activity.user_id THEN 1 END) as messages_received,
    COUNT(DISTINCT m.chat_id) as chats_active
  FROM messages m
  JOIN chat_participants cp ON m.chat_id = cp.chat_id
  WHERE cp.user_id = get_user_activity.user_id
    AND m.created_at >= CURRENT_DATE - INTERVAL '1 day' * days
  GROUP BY DATE(m.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;
```

### **5. Database Triggers for Data Integrity**

#### **5.1 Auto-update Message Status**
```sql
CREATE OR REPLACE FUNCTION auto_create_message_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Create message status entries for all chat participants
  INSERT INTO message_status (message_id, user_id, status)
  SELECT NEW.id, cp.user_id, 
    CASE WHEN cp.user_id = NEW.sender_id THEN 'sent' ELSE 'sent' END
  FROM chat_participants cp
  WHERE cp.chat_id = NEW.chat_id AND cp.is_active = TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_message_status
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_message_status();
```

#### **5.2 Update Chat Last Activity**
```sql
CREATE OR REPLACE FUNCTION update_chat_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats 
  SET updated_at = NOW()
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_last_activity
  AFTER INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_last_activity();
```

### **6. Database Partitioning Strategy**

#### **6.1 Messages Table Partitioning**
```sql
-- Partition messages by month for better performance
CREATE TABLE messages_2024_01 PARTITION OF messages
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE messages_2024_02 PARTITION OF messages
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Continue for each month...
```

### **7. Database Backup and Recovery**

#### **7.1 Automated Backup Strategy**
```sql
-- Create backup function
CREATE OR REPLACE FUNCTION create_backup()
RETURNS TEXT AS $$
DECLARE
  backup_file TEXT;
BEGIN
  backup_file := 'backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS') || '.sql';
  
  -- This would be called from a cron job or external script
  PERFORM pg_dump(
    'host=localhost dbname=whatsapp_clone user=backup_user',
    '--format=custom',
    '--file=' || backup_file
  );
  
  RETURN backup_file;
END;
$$ LANGUAGE plpgsql;
```

This enhanced database design provides:
- **Advanced relationships** with proper constraints
- **Full-text search** capabilities
- **Performance optimization** with strategic indexing
- **Data integrity** with triggers and constraints
- **Scalability** with partitioning
- **Analytics** with views and functions
- **Backup and recovery** strategies

#### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture_url TEXT,
  status TEXT,
  about TEXT,
  last_seen TIMESTAMP,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Chats Table**
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type ENUM('individual', 'group') NOT NULL,
  name VARCHAR(255),
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Chat_Participants Table**
```sql
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role ENUM('admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);
```

#### **Messages Table**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  message_type ENUM('text', 'image', 'video', 'audio', 'document', 'location') DEFAULT 'text',
  media_url TEXT,
  reply_to_id UUID REFERENCES messages(id),
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Message_Status Table**
```sql
CREATE TABLE message_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **2. Indexes for Performance**
```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_username ON users(username);

-- Messages table indexes
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at);

-- Message status indexes
CREATE INDEX idx_message_status_message_id ON message_status(message_id);
CREATE INDEX idx_message_status_user_id ON message_status(user_id);
```

---

## **🔌 API Design & Architecture**

### **1. RESTful API Design**

#### **1.1 API Base Structure**
```typescript
// Base API configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API response wrapper
interface ApiResponse<T = any> {
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
```

#### **1.2 Authentication Endpoints**
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  phone?: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    username: string;
    isVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

// POST /api/auth/logout
interface LogoutRequest {
  refreshToken: string;
}

// POST /api/auth/verify-email
interface VerifyEmailRequest {
  token: string;
}

// POST /api/auth/forgot-password
interface ForgotPasswordRequest {
  email: string;
}

// POST /api/auth/reset-password
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

#### **1.3 User Management Endpoints**
```typescript
// GET /api/users/profile
interface UserProfile {
  id: string;
  email: string;
  username: string;
  phone?: string;
  profilePictureUrl?: string;
  status?: string;
  about?: string;
  lastSeen: string;
  isOnline: boolean;
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

// PUT /api/users/profile
interface UpdateProfileRequest {
  username?: string;
  status?: string;
  about?: string;
  profilePicture?: File;
  privacySettings?: Partial<UserProfile['privacySettings']>;
  notificationSettings?: Partial<UserProfile['notificationSettings']>;
}

// GET /api/users/search
interface UserSearchRequest {
  query: string;
  limit?: number;
  offset?: number;
}

interface UserSearchResponse {
  users: Array<{
    id: string;
    username: string;
    profilePictureUrl?: string;
    status?: string;
    isOnline: boolean;
    lastSeen: string;
  }>;
  total: number;
}

// POST /api/users/block
interface BlockUserRequest {
  userId: string;
}

// POST /api/users/unblock
interface UnblockUserRequest {
  userId: string;
}
```

#### **1.4 Chat Management Endpoints**
```typescript
// GET /api/chats
interface GetChatsRequest {
  limit?: number;
  offset?: number;
  search?: string;
}

interface ChatSummary {
  id: string;
  name: string;
  type: 'individual' | 'group';
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

// POST /api/chats
interface CreateChatRequest {
  type: 'individual' | 'group';
  name?: string;
  description?: string;
  participantIds: string[];
}

// GET /api/chats/:chatId
interface ChatDetails {
  id: string;
  name: string;
  type: 'individual' | 'group';
  description?: string;
  avatarUrl?: string;
  participants: Array<{
    id: string;
    username: string;
    profilePictureUrl?: string;
    role: 'admin' | 'member' | 'moderator';
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

// PUT /api/chats/:chatId
interface UpdateChatRequest {
  name?: string;
  description?: string;
  avatarUrl?: string;
  settings?: Partial<ChatDetails['settings']>;
}

// DELETE /api/chats/:chatId
// Leave or delete chat

// POST /api/chats/:chatId/participants
interface AddParticipantRequest {
  userId: string;
  role?: 'member' | 'moderator';
}

// DELETE /api/chats/:chatId/participants/:userId
// Remove participant from chat

// PUT /api/chats/:chatId/participants/:userId/role
interface UpdateParticipantRoleRequest {
  role: 'admin' | 'member' | 'moderator';
}
```

#### **1.5 Message Management Endpoints**
```typescript
// GET /api/chats/:chatId/messages
interface GetMessagesRequest {
  limit?: number;
  before?: string; // message ID for pagination
  after?: string; // message ID for pagination
  search?: string;
}

interface Message {
  id: string;
  chatId: string;
  sender: {
    id: string;
    username: string;
    profilePictureUrl?: string;
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker';
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
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
}

// POST /api/chats/:chatId/messages
interface SendMessageRequest {
  content: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker';
  replyToId?: string;
  mediaFile?: File;
}

// PUT /api/chats/:chatId/messages/:messageId
interface EditMessageRequest {
  content: string;
}

// DELETE /api/chats/:chatId/messages/:messageId
interface DeleteMessageRequest {
  deleteForEveryone?: boolean;
}

// POST /api/chats/:chatId/messages/:messageId/reactions
interface AddReactionRequest {
  emoji: string;
}

// DELETE /api/chats/:chatId/messages/:messageId/reactions/:emoji
// Remove reaction

// POST /api/chats/:chatId/messages/:messageId/read
// Mark message as read
```

#### **1.6 Media Management Endpoints**
```typescript
// POST /api/upload/presigned-url
interface GetUploadUrlRequest {
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileName: string;
  fileSize: number;
  chatId?: string;
}

interface GetUploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

// POST /api/upload/complete
interface CompleteUploadRequest {
  fileKey: string;
  messageId: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    mimeType: string;
  };
}

// GET /api/media/:fileId
interface MediaFile {
  id: string;
  fileName: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
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
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

// GET /api/media/:fileId/status
interface MediaProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
  error?: string;
}
```

### **2. WebSocket API Design**

#### **2.1 Connection Management**
```typescript
// Connection events
interface SocketConnection {
  userId: string;
  socketId: string;
  userAgent: string;
  ipAddress: string;
  connectedAt: string;
}

// Authentication
interface SocketAuth {
  token: string;
  userId: string;
}
```

#### **2.2 Real-time Events**

##### **Client to Server Events**
```typescript
// Connection events
'socket:connect'
'socket:disconnect'
'socket:reconnect'

// Authentication
'auth:login'
'auth:logout'
'auth:verify'

// Messaging
'message:send'
'message:typing'
'message:stop_typing'
'message:read'
'message:reaction'
'message:delete'

// Chat management
'chat:join'
'chat:leave'
'chat:create'
'chat:update'
'chat:participant:add'
'chat:participant:remove'

// User status
'user:online'
'user:offline'
'user:status_update'
'user:typing'

// Media
'media:upload:start'
'media:upload:progress'
'media:upload:complete'
'media:processing:status'
```

##### **Server to Client Events**
```typescript
// Message events
'message:received'
'message:delivered'
'message:read'
'message:edited'
'message:deleted'
'message:reaction:added'
'message:reaction:removed'
'message:typing'
'message:stop_typing'

// Chat events
'chat:created'
'chat:updated'
'chat:deleted'
'chat:participant:joined'
'chat:participant:left'
'chat:participant:role_changed'

// User events
'user:online'
'user:offline'
'user:status_updated'
'user:typing'

// Media events
'media:processing:started'
'media:processing:progress'
'media:processing:completed'
'media:processing:failed'

// System events
'system:maintenance'
'system:notification'
'error:general'
```

#### **2.3 Event Payloads**
```typescript
// Message event payloads
interface MessageReceivedPayload {
  message: Message;
  chatId: string;
  timestamp: string;
}

interface MessageDeliveredPayload {
  messageId: string;
  chatId: string;
  deliveredTo: string[];
  timestamp: string;
}

interface MessageReadPayload {
  messageId: string;
  chatId: string;
  readBy: string;
  timestamp: string;
}

interface TypingPayload {
  chatId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

// Chat event payloads
interface ChatCreatedPayload {
  chat: ChatDetails;
  participants: string[];
}

interface ParticipantJoinedPayload {
  chatId: string;
  participant: {
    id: string;
    username: string;
    profilePictureUrl?: string;
    role: string;
  };
}

// User event payloads
interface UserStatusPayload {
  userId: string;
  username: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

// Media event payloads
interface MediaProcessingPayload {
  fileId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}
```

### **3. API Error Handling**

#### **3.1 Error Response Format**
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// Error codes
enum ErrorCodes {
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
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

#### **3.2 Error Handling Middleware**
```typescript
// Express error handling middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const errorId = generateErrorId();
  
  // Log error with context
  logger.error('API Error', {
    errorId,
    error: err,
    request: {
      method: req.method,
      url: req.url,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });
  
  // Determine error type
  let statusCode = 500;
  let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  
  if (err instanceof ValidationError) {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = 'Validation failed';
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    errorCode = ErrorCodes.UNAUTHORIZED;
    message = 'Authentication required';
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    errorCode = ErrorCodes.RESOURCE_NOT_FOUND;
    message = 'Resource not found';
  } else if (err instanceof RateLimitError) {
    statusCode = 429;
    errorCode = ErrorCodes.RATE_LIMIT_EXCEEDED;
    message = 'Too many requests';
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details: err.details || null,
      timestamp: new Date().toISOString(),
      requestId: errorId
    }
  });
};
```

### **4. API Rate Limiting**

#### **4.1 Rate Limiting Strategy**
```typescript
// Rate limiting configuration
const rateLimitConfig = {
  // General API limits
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP'
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts'
  },
  
  // Message sending
  messages: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 messages per minute
    message: 'Message rate limit exceeded'
  },
  
  // File uploads
  uploads: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: 'Upload rate limit exceeded'
  }
};

// Apply rate limiting middleware
app.use('/api/auth', rateLimit(rateLimitConfig.auth));
app.use('/api/chats/*/messages', rateLimit(rateLimitConfig.messages));
app.use('/api/upload', rateLimit(rateLimitConfig.uploads));
app.use('/api', rateLimit(rateLimitConfig.general));
```

### **5. API Documentation**

#### **5.1 OpenAPI/Swagger Specification**
```yaml
openapi: 3.0.0
info:
  title: WhatsApp Clone API
  version: 1.0.0
  description: Real-time messaging API with WebSocket support

servers:
  - url: https://api.whatsapp-clone.com
    description: Production server
  - url: https://staging-api.whatsapp-clone.com
    description: Staging server
  - url: http://localhost:3001
    description: Development server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        username:
          type: string
        profilePictureUrl:
          type: string
        isOnline:
          type: boolean
        lastSeen:
          type: string
          format: date-time
    
    Message:
      type: object
      properties:
        id:
          type: string
          format: uuid
        content:
          type: string
        type:
          type: string
          enum: [text, image, video, audio, document]
        sender:
          $ref: '#/components/schemas/User'
        createdAt:
          type: string
          format: date-time

paths:
  /api/auth/login:
    post:
      summary: User login
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 6
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/User'
                  tokens:
                    type: object
                    properties:
                      accessToken:
                        type: string
                      refreshToken:
                        type: string
        '401':
          description: Invalid credentials
```

## **🔄 Real-time Architecture**

### **1. WebSocket Events**

#### **Client to Server**
```typescript
// Connection events
'socket:connect'
'socket:disconnect'

// Authentication
'auth:login'
'auth:logout'

// Messaging
'message:send'
'message:typing'
'message:stop_typing'
'message:read'

// Chat management
'chat:join'
'chat:leave'
'chat:create'
'chat:update'

// User status
'user:online'
'user:offline'
'user:status_update'
```

#### **Server to Client**
```typescript
// Message events
'message:received'
'message:delivered'
'message:read'
'message:typing'
'message:stop_typing'

// Chat events
'chat:created'
'chat:updated'
'chat:deleted'
'chat:member_joined'
'chat:member_left'

// User events
'user:online'
'user:offline'
'user:status_updated'
```

### **2. Message Queue Architecture**
```typescript
// Queue names
const QUEUES = {
  MESSAGE_DELIVERY: 'message-delivery',
  NOTIFICATION: 'notification',
  MEDIA_PROCESSING: 'media-processing',
  EMAIL: 'email',
  SMS: 'sms'
};

// Job types
const JOB_TYPES = {
  SEND_MESSAGE: 'send-message',
  SEND_NOTIFICATION: 'send-notification',
  PROCESS_MEDIA: 'process-media',
  SEND_EMAIL: 'send-email',
  SEND_SMS: 'send-sms'
};
```

---

## **🎨 UI/UX Design**

### **1. Design System**
- **Color Palette**: WhatsApp-inspired green theme
- **Typography**: Inter font family
- **Icons**: Lucide React icons
- **Animations**: Framer Motion
- **Responsive**: Mobile-first design

### **2. Key Screens**
- **Login/Register**: Clean authentication flow
- **Chat List**: Recent conversations with preview
- **Chat Screen**: Message interface with media support
- **Profile**: User settings and information
- **Settings**: App configuration and privacy

### **3. Mobile Optimization**
- **Touch-friendly**: 44px minimum touch targets
- **Gesture support**: Swipe actions
- **Keyboard handling**: Proper input management
- **Offline support**: Service worker caching

---

## **🚀 Deployment Strategy**

### **1. Frontend Deployment (Vercel)**
```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.whatsapp-clone.com",
    "NEXT_PUBLIC_WS_URL": "wss://ws.whatsapp-clone.com"
  }
}
```

### **2. Backend Deployment (Railway/Render)**
```yaml
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### **3. Database Setup (Neon DB)**
- **Primary**: Neon PostgreSQL
- **Connection pooling**: PgBouncer
- **Backup**: Automated daily backups
- **Monitoring**: Neon dashboard

---

## **📈 Performance Optimization**

### **1. Frontend Optimizations**
- **Code splitting**: Dynamic imports
- **Image optimization**: Next.js Image component
- **Bundle optimization**: Tree shaking
- **Caching**: Service worker + CDN
- **Lazy loading**: Components and routes

### **2. Backend Optimizations**
- **Database indexing**: Strategic indexes
- **Query optimization**: Efficient SQL queries
- **Caching**: Redis for session and data
- **Connection pooling**: Database connections
- **Rate limiting**: API protection

### **3. Real-time Optimizations**
- **Message batching**: Batch small messages
- **Connection pooling**: WebSocket connections
- **Message queuing**: Bull Queue for reliability
- **Load balancing**: Multiple WebSocket servers

---

## **🧪 Testing Strategy**

### **1. Frontend Testing**
- **Unit tests**: Jest + React Testing Library
- **Integration tests**: Cypress
- **E2E tests**: Playwright
- **Performance tests**: Lighthouse CI

### **2. Backend Testing**
- **Unit tests**: Jest
- **Integration tests**: Supertest
- **API tests**: Postman/Newman
- **Load tests**: Artillery

### **3. Database Testing**
- **Migration tests**: Prisma migrations
- **Data integrity**: Foreign key constraints
- **Performance tests**: Query optimization

---

## **📊 Monitoring & Analytics**

### **1. Application Monitoring**
- **Error tracking**: Sentry
- **Performance monitoring**: Vercel Analytics
- **Uptime monitoring**: UptimeRobot
- **Log management**: Winston + CloudWatch

### **2. Business Analytics**
- **User metrics**: Active users, retention
- **Message metrics**: Volume, delivery rates
- **Performance metrics**: Response times, errors
- **Business metrics**: User growth, engagement

---

## **🔄 Development Phases & Implementation Roadmap**

### **Phase 1: Foundation & Architecture (Week 1-2)**

#### **Week 1: Project Setup & Core Infrastructure**
- [ ] **Monorepo Setup**
  - [ ] Turbo repo configuration with TypeScript
  - [ ] Shared packages setup (UI, utils, types)
  - [ ] ESLint, Prettier, Husky configuration
  - [ ] GitHub Actions CI/CD pipeline

- [ ] **Database Design & Setup**
  - [ ] Neon PostgreSQL database provisioning
  - [ ] Prisma schema design and migrations
  - [ ] Database seeding scripts
  - [ ] Connection pooling configuration

- [ ] **Authentication System**
  - [ ] JWT token implementation with refresh rotation
  - [ ] Password hashing with bcrypt
  - [ ] Rate limiting with Express Rate Limit
  - [ ] Session management with Redis

#### **Week 2: Backend Foundation**
- [ ] **Express.js API Setup**
  - [ ] TypeScript configuration with strict mode
  - [ ] Middleware stack (CORS, Helmet, compression)
  - [ ] Error handling middleware
  - [ ] Request validation with Zod

- [ ] **User Management System**
  - [ ] User registration with email verification
  - [ ] Phone number verification with Twilio
  - [ ] Profile management API
  - [ ] User search and discovery

- [ ] **Real-time Infrastructure**
  - [ ] Socket.io server setup
  - [ ] Redis adapter for horizontal scaling
  - [ ] Authentication middleware for WebSocket
  - [ ] Connection management and cleanup

### **Phase 2: Core Messaging & Real-time (Week 3-4)**

#### **Week 3: Messaging Core**
- [ ] **Message System Implementation**
  - [ ] Message CRUD operations with Prisma
  - [ ] Real-time message delivery with Socket.io
  - [ ] Message status tracking (sent, delivered, read)
  - [ ] Message threading and replies

- [ ] **Chat Management**
  - [ ] Individual chat creation and management
  - [ ] Chat participants and permissions
  - [ ] Chat history with pagination
  - [ ] Chat search and filtering

- [ ] **Message Queue Setup**
  - [ ] Bull Queue with Redis for background jobs
  - [ ] Message delivery queue
  - [ ] Notification queue for push notifications
  - [ ] Media processing queue

#### **Week 4: Advanced Real-time Features**
- [ ] **Real-time Features**
  - [ ] Typing indicators
  - [ ] Online/offline status
  - [ ] Last seen functionality
  - [ ] Message synchronization across devices

- [ ] **Group Chat Implementation**
  - [ ] Group creation and management
  - [ ] Group admin roles and permissions
  - [ ] Group invite links and QR codes
  - [ ] Group settings and moderation

- [ ] **Message Features**
  - [ ] Message reactions with emojis
  - [ ] Message forwarding
  - [ ] Message deletion (for everyone)
  - [ ] Message editing with history

### **Phase 3: Media & Advanced Features (Week 5-6)**

#### **Week 5: Media System**
- [ ] **File Upload Infrastructure**
  - [ ] AWS S3 bucket setup with CloudFront
  - [ ] Presigned URL generation for secure uploads
  - [ ] File type validation and virus scanning
  - [ ] Upload progress tracking

- [ ] **Media Processing Pipeline**
  - [ ] Image processing with Sharp.js (WebP, thumbnails)
  - [ ] Video processing with FFmpeg (compression, thumbnails)
  - [ ] Audio processing with waveform generation
  - [ ] Document preview generation

- [ ] **Media Management**
  - [ ] Media gallery implementation
  - [ ] Media search and filtering
  - [ ] Media download and sharing
  - [ ] Storage optimization and cleanup

#### **Week 6: Advanced Features & UI**
- [ ] **Search & Discovery**
  - [ ] Full-text search with PostgreSQL
  - [ ] Message search with highlighting
  - [ ] Contact search and filtering
  - [ ] Advanced search filters

- [ ] **Privacy & Security**
  - [ ] End-to-end encryption (optional)
  - [ ] Privacy settings and controls
  - [ ] Block/unblock functionality
  - [ ] Data export and deletion

- [ ] **Advanced UI Features**
  - [ ] Dark/light theme support
  - [ ] Responsive design for all devices
  - [ ] Accessibility features (ARIA, keyboard navigation)
  - [ ] Progressive Web App (PWA) features

### **Phase 4: Performance & Production (Week 7-8)**

#### **Week 7: Performance Optimization**
- [ ] **Frontend Optimization**
  - [ ] Code splitting and lazy loading
  - [ ] Image optimization with Next.js Image
  - [ ] Bundle analysis and optimization
  - [ ] Core Web Vitals optimization

- [ ] **Backend Optimization**
  - [ ] Database query optimization
  - [ ] Redis caching strategy
  - [ ] API response compression
  - [ ] Connection pooling optimization

- [ ] **Real-time Optimization**
  - [ ] WebSocket connection pooling
  - [ ] Message batching for efficiency
  - [ ] Load balancing for WebSocket servers
  - [ ] Horizontal scaling preparation

#### **Week 8: Deployment & Monitoring**
- [ ] **Production Deployment**
  - [ ] Vercel deployment for frontend
  - [ ] Railway/Render deployment for backend
  - [ ] Database migration to production
  - [ ] Environment configuration management

- [ ] **Monitoring & Analytics**
  - [ ] Sentry error tracking setup
  - [ ] Performance monitoring with Vercel Analytics
  - [ ] Uptime monitoring with UptimeRobot
  - [ ] Custom metrics and dashboards

- [ ] **Testing & Quality Assurance**
  - [ ] Unit tests with Jest
  - [ ] Integration tests with Supertest
  - [ ] E2E tests with Playwright
  - [ ] Load testing with Artillery

### **Phase 5: Enterprise Features (Week 9-10) - Optional**

#### **Week 9: Enterprise Features**
- [ ] **Advanced Security**
  - [ ] Two-factor authentication (2FA)
  - [ ] Audit logging and compliance
  - [ ] Advanced rate limiting
  - [ ] Security headers and CSP

- [ ] **Admin Dashboard**
  - [ ] User management interface
  - [ ] System monitoring dashboard
  - [ ] Analytics and reporting
  - [ ] Configuration management

#### **Week 10: Mobile & Advanced Features**
- [ ] **Mobile Optimization**
  - [ ] PWA with offline support
  - [ ] Mobile-specific UI optimizations
  - [ ] Touch gesture support
  - [ ] Push notifications

- [ ] **Advanced Features**
  - [ ] Voice and video calling (WebRTC)
  - [ ] Location sharing with maps
  - [ ] Contact import/export
  - [ ] Backup and restore functionality

---

## **💰 Cost Estimation**

### **Monthly Costs**
- **Neon DB**: $20/month (Pro plan)
- **Redis Cloud**: $15/month
- **Vercel Pro**: $20/month
- **Railway/Render**: $25/month
- **AWS S3**: $5/month
- **Monitoring**: $10/month
- **Total**: ~$95/month

### **Development Costs**
- **Development time**: 8 weeks
- **Third-party services**: $200 setup
- **Domain & SSL**: $20/year
- **Total development**: ~$1,000

---

## **🎯 Success Criteria**

### **Technical Success**
- [ ] Sub-100ms message delivery
- [ ] 99.9% uptime
- [ ] Lighthouse score >95
- [ ] Support 10,000+ concurrent users
- [ ] Zero critical security vulnerabilities

### **Business Success**
- [ ] Complete feature parity with basic WhatsApp
- [ ] Smooth user experience across devices
- [ ] Reliable real-time messaging
- [ ] Scalable architecture
- [ ] Production-ready deployment

### **Portfolio Success**
- [ ] Demonstrates full-stack capabilities
- [ ] Shows advanced system design knowledge
- [ ] Proves real-time application skills
- [ ] Validates performance optimization expertise
- [ ] Showcases modern development practices

---

## **📝 Implementation Notes**

### **Key Technical Decisions**
1. **Next.js 14**: Latest features and performance
2. **TypeScript**: Type safety and better DX
3. **PostgreSQL**: ACID compliance and scalability
4. **WebSocket**: Real-time communication
5. **Message Queue**: Reliability and scalability
6. **Redis**: Caching and session management

### **Performance Considerations**
1. **Database indexing**: Strategic query optimization
2. **Message batching**: Reduce WebSocket overhead
3. **Image compression**: Reduce bandwidth usage
4. **Lazy loading**: Improve initial load times
5. **Caching strategy**: Multiple layers of caching

### **Security Considerations**
1. **Input validation**: Prevent injection attacks
2. **Rate limiting**: Prevent abuse
3. **Authentication**: Secure token management
4. **Data encryption**: Protect sensitive information
5. **Privacy compliance**: GDPR considerations

This PRD provides a comprehensive roadmap for building a production-ready WhatsApp clone that will showcase your advanced full-stack development skills and system design expertise. 