# 📱 WhatsApp Clone Backend

A high-performance, scalable Express.js backend for the WhatsApp clone with real-time messaging, file uploads, and advanced features.

## 🚀 Features

- **Real-time Messaging**: WebSocket-based instant messaging
- **File Upload System**: AWS S3 integration with media processing
- **Authentication**: JWT-based authentication with refresh tokens
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and caching
- **Message Queue**: Bull Queue for background jobs
- **Security**: Rate limiting, CORS, Helmet, input validation
- **Monitoring**: Winston logging with daily rotation
- **TypeScript**: Full TypeScript support with strict mode

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express.js    │    │   Socket.io     │    │   Redis Cache   │
│   (REST API)    │◄──►│   (WebSocket)   │◄──►│   (Session)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Bull Queue    │    │   AWS S3        │
│   (Neon DB)     │    │   (Background)  │    │   (Storage)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL (Neon DB recommended)
- Redis
- AWS Account (for S3 storage)
- Twilio Account (for SMS)
- SendGrid Account (for email)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd apps/whatsapp-clone-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3001
   
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_clone"
   
   # Redis Configuration
   REDIS_URL="redis://localhost:6379"
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=whatsapp-clone-media
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users

### Chat Management

- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:chatId` - Get chat details
- `PUT /api/chats/:chatId` - Update chat
- `DELETE /api/chats/:chatId` - Delete chat

### Messaging

- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages/:chatId` - Send message
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete message

### Media Management

- `POST /api/media/upload/presigned-url` - Get upload URL
- `POST /api/media/upload/complete` - Complete upload
- `GET /api/media/:fileId` - Get media file info

## 🔌 WebSocket Events

### Client to Server
- `auth:login` - Authenticate user
- `auth:logout` - Logout user
- `message:send` - Send message
- `message:typing` - Typing indicator
- `message:stop_typing` - Stop typing indicator
- `message:read` - Mark message as read
- `chat:join` - Join chat room
- `chat:leave` - Leave chat room
- `user:online` - User online status
- `user:offline` - User offline status

### Server to Client
- `message:received` - New message received
- `message:delivered` - Message delivered
- `message:read` - Message read
- `message:typing` - User typing
- `message:stop_typing` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and profiles
- **chats** - Chat rooms (individual and group)
- **chat_participants** - Chat membership
- **messages** - Chat messages
- **message_status** - Message delivery status
- **message_reactions** - Message reactions
- **media_files** - Uploaded media files
- **user_relationships** - User relationships (contacts, blocked)

## 🔒 Security Features

- **JWT Authentication** with refresh token rotation
- **Rate Limiting** for API protection
- **Input Validation** with Zod schemas
- **CORS Protection** with configurable origins
- **Helmet Security Headers**
- **SQL Injection Protection** via Prisma ORM
- **File Upload Security** with type validation

## 📊 Performance Features

- **Redis Caching** for session and data caching
- **Database Connection Pooling** via Prisma
- **Message Queue** for background processing
- **Image/Video Processing** with Sharp.js and FFmpeg
- **CDN Integration** with AWS CloudFront
- **Compression** with gzip

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=your-production-database-url
REDIS_URL=your-production-redis-url
JWT_SECRET=your-production-jwt-secret
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 📈 Monitoring

- **Winston Logging** with daily rotation
- **Error Tracking** with structured logging
- **Performance Monitoring** with request logging
- **Health Check Endpoint** at `/health`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database

### Code Quality

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Strict Mode** enabled

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Follow the commit message convention

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the PRD for detailed specifications

---

**Built with ❤️ using Express.js, TypeScript, PostgreSQL, Redis, and Socket.io** 