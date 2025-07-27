# WhatsApp Clone Frontend

A modern, real-time messaging application built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Real-time Messaging**: WebSocket-based instant messaging
- **Media Sharing**: Support for images, videos, audio, and documents
- **Group Chats**: Create and manage group conversations
- **User Authentication**: Secure JWT-based authentication
- **Responsive Design**: Mobile-first responsive design
- **Dark Mode**: Built-in dark/light theme support
- **PWA Support**: Progressive Web App capabilities
- **Voice & Video**: WebRTC-based calling features
- **Message Reactions**: Emoji reactions on messages
- **Message Search**: Full-text search across conversations
- **File Upload**: Drag & drop file upload with progress
- **Typing Indicators**: Real-time typing status
- **Online Status**: User online/offline indicators
- **Message Status**: Sent, delivered, and read receipts

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library
- **Zustand**: State management
- **React Query**: Data fetching and caching
- **Socket.io Client**: Real-time communication
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **Storybook**: Component documentation
- **Husky**: Git hooks
- **Lint-staged**: Pre-commit linting

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── chat/             # Chat-specific components
│   ├── auth/             # Authentication components
│   └── layout/           # Layout components
├── features/             # Feature-based modules
│   ├── chat/             # Chat functionality
│   ├── auth/             # Authentication
│   ├── media/            # Media handling
│   └── settings/         # User settings
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── store/                # Zustand stores
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── styles/               # Global styles
├── constants/            # Application constants
├── services/             # API services
├── api/                  # API routes
├── contexts/             # React contexts
└── providers/            # Context providers
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd all-portfolio-projects
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=your-database-url

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Redis
REDIS_URL=your-redis-url

# Email (Optional)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

## 🧪 Testing

### Unit Tests
```bash
yarn test
```

### E2E Tests
```bash
yarn e2e
```

### Coverage Report
```bash
yarn test:coverage
```

## 📦 Build

### Development Build
```bash
yarn build
```

### Production Build
```bash
yarn build
yarn start
```

### Bundle Analysis
```bash
ANALYZE=true yarn build
```

## 🎨 Styling

This project uses Tailwind CSS with a custom design system:

- **Color Palette**: WhatsApp-inspired colors
- **Typography**: Inter font family
- **Animations**: Custom keyframes for smooth interactions
- **Dark Mode**: Built-in theme support
- **Responsive**: Mobile-first design approach

## 🔧 Development

### Code Quality

- **ESLint**: Configured with TypeScript, React, and accessibility rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks
- **TypeScript**: Strict type checking

### Git Workflow

1. Create a feature branch
2. Make your changes
3. Run tests: `yarn test`
4. Run linting: `yarn lint`
5. Commit with conventional commits
6. Create a pull request

### Conventional Commits

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 📱 PWA Features

- **Offline Support**: Service worker for offline functionality
- **Install Prompt**: Add to home screen capability
- **Push Notifications**: Real-time notifications
- **Background Sync**: Sync when online

## 🔒 Security

- **CSP Headers**: Content Security Policy
- **XSS Protection**: Built-in XSS protection
- **CSRF Protection**: Cross-Site Request Forgery protection
- **Rate Limiting**: API rate limiting
- **Input Validation**: Zod schema validation

## 📊 Performance

- **Code Splitting**: Automatic code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Lighthouse**: Performance monitoring
- **Core Web Vitals**: Optimized for web vitals

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically

### Other Platforms
- **Netlify**: Static site hosting
- **AWS Amplify**: Full-stack hosting
- **Railway**: Simple deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Tailwind CSS**: For the utility-first CSS
- **Radix UI**: For accessible components
- **Vercel**: For hosting and deployment
- **Socket.io**: For real-time communication

## 📞 Support

If you have any questions or need help:

- Create an issue on GitHub
- Join our Discord community
- Check the documentation

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
