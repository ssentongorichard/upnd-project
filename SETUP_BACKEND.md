# UPND Membership System - Backend Setup

This document provides comprehensive instructions for setting up the backend functionality of the UPND Membership System using Next.js, PostgreSQL, Drizzle ORM, NextAuth, and other modern technologies.

## 🛠️ Technologies Used

- **Next.js 15** - React framework with App Router
- **PostgreSQL** - Database (via Neon)
- **Drizzle ORM** - Type-safe database ORM
- **NextAuth.js** - Authentication
- **SWR** - Data fetching and caching
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Server Actions** - Server-side functions
- **SSR** - Server-side rendering

## 📋 Prerequisites

1. Node.js 18+ installed
2. A Neon PostgreSQL database
3. Git installed

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd upnd-project
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/upnd_db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App Configuration
NODE_ENV="development"
```

### 3. Database Setup

Run the database migration script to create all necessary tables:

```bash
npm run db:setup
```

This will create:
- NextAuth tables (users, accounts, sessions, verification_tokens)
- Application tables (members, events, disciplinary_cases, etc.)
- Proper indexes for performance

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Architecture Overview

### Database Schema

The system uses a comprehensive PostgreSQL schema with the following main entities:

- **Members** - Core member information and registration data
- **Events** - Party events and meetings
- **Disciplinary Cases** - Member disciplinary records
- **Membership Cards** - Digital membership cards with QR codes
- **Communications** - SMS, email, and push notifications
- **Event RSVPs** - Event attendance tracking

### API Structure

The backend provides both Server Actions and REST API endpoints:

#### Server Actions (`/src/lib/actions/`)
- `members.ts` - Member CRUD operations
- `events.ts` - Event management and RSVPs
- `disciplinary.ts` - Disciplinary case management
- `communications.ts` - Communication system
- `membership-cards.ts` - Card management

#### REST API (`/src/app/api/`)
- `/api/members` - Member endpoints
- `/api/events` - Event endpoints
- `/api/disciplinary-cases` - Disciplinary endpoints
- `/api/communications` - Communication endpoints
- `/api/membership-cards` - Card endpoints
- `/api/statistics` - Dashboard statistics

### Authentication

The system uses NextAuth.js with:
- Credentials provider for email/password login
- JWT-based sessions
- Role-based access control
- Database adapter for user management

### Data Fetching

SWR is used for client-side data fetching with:
- Automatic caching
- Background revalidation
- Error handling
- Optimistic updates

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database commands
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:setup     # Run initial setup
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── register/          # Public registration
├── components/            # React components
│   ├── Auth/             # Authentication components
│   ├── Dashboard/        # Dashboard components
│   ├── Members/          # Member management
│   ├── Events/           # Event management
│   └── providers/        # Context providers
├── context/              # React contexts
├── db/                   # Database configuration
│   ├── schema.ts         # Main schema
│   └── auth-schema.ts    # NextAuth schema
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── actions/          # Server actions
│   ├── api.ts            # API utilities
│   ├── auth.ts           # NextAuth config
│   ├── swr.ts            # SWR hooks
│   └── validations.ts    # Zod schemas
└── types/                # TypeScript types
```

## 🔐 Authentication & Authorization

### User Roles

- **National Admin** - Full system access
- **Provincial Admin** - Province-level management
- **District Admin** - District-level management
- **Constituency Admin** - Constituency-level management
- **Ward Admin** - Ward-level management
- **Branch Admin** - Branch-level management
- **Section Admin** - Section-level management
- **Member** - Basic member access

### Permissions

Each role has specific permissions for:
- Viewing data within their jurisdiction
- Approving member applications
- Managing events and communications
- Generating reports
- System administration

## 📊 Features Implemented

### Member Management
- ✅ Member registration with geolocation
- ✅ Multi-level approval workflow
- ✅ Member search and filtering
- ✅ Status tracking and updates
- ✅ Profile management

### Event Management
- ✅ Event creation and management
- ✅ RSVP system
- ✅ Attendance tracking
- ✅ Location-based events

### Disciplinary System
- ✅ Case creation and tracking
- ✅ Severity classification
- ✅ Status management
- ✅ Member-specific records

### Communication System
- ✅ Multi-channel communications (SMS, Email, Push)
- ✅ Recipient filtering
- ✅ Delivery tracking
- ✅ Template management

### Membership Cards
- ✅ Digital card generation
- ✅ QR code integration
- ✅ Expiry tracking
- ✅ Renewal reminders

### Dashboard & Analytics
- ✅ Real-time statistics
- ✅ Provincial distribution
- ✅ Monthly trends
- ✅ Status breakdowns

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
NODE_ENV="production"
```

### Build and Deploy

```bash
npm run build
npm start
```

## 🧪 Testing

The system includes comprehensive error handling and validation:

- Zod schema validation for all inputs
- Server-side error handling
- Client-side error boundaries
- SWR error retry mechanisms

## 📝 API Documentation

### Member Endpoints

```typescript
GET /api/members              // Get all members with filters
POST /api/members             // Create new member
GET /api/members/[id]         // Get specific member
PUT /api/members/[id]         // Update member
DELETE /api/members/[id]      // Delete member
```

### Event Endpoints

```typescript
GET /api/events               // Get all events
POST /api/events              // Create new event
GET /api/events/[id]          // Get specific event
PUT /api/events/[id]          // Update event
DELETE /api/events/[id]       // Delete event
GET /api/events/[id]/rsvps    // Get event RSVPs
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check Neon database is active
   - Ensure SSL mode is enabled

2. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Clear browser cookies/localStorage

3. **Build Issues**
   - Run `npm run db:setup` first
   - Check all environment variables
   - Clear `.next` folder and rebuild

### Getting Help

- Check the console for error messages
- Verify database tables exist
- Test API endpoints directly
- Check network tab for failed requests

## 📈 Performance Considerations

- Database indexes on frequently queried columns
- SWR caching for reduced API calls
- Server-side rendering for initial page loads
- Optimized queries with Drizzle ORM
- Connection pooling with Neon

## 🔒 Security Features

- Input validation with Zod
- SQL injection prevention with Drizzle
- CSRF protection with NextAuth
- Role-based access control
- Secure session management
- Environment variable protection

This backend setup provides a robust, scalable foundation for the UPND Membership System with modern development practices and comprehensive functionality.