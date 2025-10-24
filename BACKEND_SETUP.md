# UPND Membership System - Backend Setup Guide

This guide will help you set up the backend functionality for the UPND Membership System using Next.js, PostgreSQL, Drizzle ORM, NextAuth, and other modern technologies.

## 🚀 Technologies Used

- **Next.js 15** with App Router
- **PostgreSQL** (Neon Database)
- **Drizzle ORM** for database operations
- **NextAuth.js** for authentication
- **Zod** for data validation
- **SWR** for data fetching and caching
- **Server Actions** for API operations
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components

## 📋 Prerequisites

1. Node.js 18+ installed
2. A Neon PostgreSQL database account
3. Git installed

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/upnd_db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Supabase (if still needed for some features)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# App Configuration
NODE_ENV="development"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Generate Database Schema
```bash
npm run db:generate
```

#### Push Schema to Database
```bash
npm run db:push
```

#### Set up Default Users
```bash
npx tsx scripts/setup-db.ts
```

### 4. Run Development Server

```bash
npm run dev
```

## 🗄️ Database Schema

The system includes the following main tables:

- **users** - User authentication and roles
- **members** - UPND member information
- **disciplinary_cases** - Disciplinary case management
- **events** - Event management
- **event_rsvps** - Event RSVP tracking
- **communications** - Communication management
- **communication_recipients** - Communication delivery tracking
- **membership_cards** - Membership card management

## 🔐 Authentication

The system uses NextAuth.js with credentials provider. Default users are created during setup:

- **National Admin**: admin@upnd.zm / upnd2024
- **Provincial Admin**: provincial@upnd.zm / upnd2024
- **District Admin**: district@upnd.zm / upnd2024
- **Branch Admin**: branch@upnd.zm / upnd2024

## 📊 Server Actions

The system includes comprehensive server actions for:

### Members
- `createMember()` - Create new member
- `updateMember()` - Update member information
- `deleteMember()` - Delete member
- `getMember()` - Get single member
- `getMembers()` - Get paginated members list
- `updateMemberStatus()` - Update member approval status

### Events
- `createEvent()` - Create new event
- `updateEvent()` - Update event
- `deleteEvent()` - Delete event
- `getEvent()` - Get single event
- `getEvents()` - Get paginated events list
- `createEventRsvp()` - Create event RSVP
- `updateEventRsvp()` - Update RSVP status

### Disciplinary Cases
- `createDisciplinaryCase()` - Create new case
- `updateDisciplinaryCase()` - Update case
- `deleteDisciplinaryCase()` - Delete case
- `getDisciplinaryCase()` - Get single case
- `getDisciplinaryCases()` - Get paginated cases list

### Communications
- `createCommunication()` - Create communication
- `updateCommunication()` - Update communication
- `deleteCommunication()` - Delete communication
- `getCommunication()` - Get single communication
- `getCommunications()` - Get paginated communications list
- `sendCommunication()` - Send communication to recipients

### Membership Cards
- `createMembershipCard()` - Create membership card
- `updateMembershipCard()` - Update card
- `deleteMembershipCard()` - Delete card
- `getMembershipCard()` - Get single card
- `getMembershipCards()` - Get paginated cards list
- `renewMembershipCard()` - Renew card
- `getExpiringCards()` - Get cards expiring soon

## 🔄 SWR Hooks

The system includes SWR hooks for efficient data fetching:

### Members
- `useMembers(queryParams)` - Fetch members with pagination
- `useMember(id)` - Fetch single member
- `useMemberStats()` - Fetch member statistics

### Events
- `useEvents(queryParams)` - Fetch events with pagination
- `useEvent(id)` - Fetch single event
- `useEventRsvps(eventId)` - Fetch event RSVPs
- `useUpcomingEvents(limit)` - Fetch upcoming events
- `useEventStats()` - Fetch event statistics

### Disciplinary Cases
- `useDisciplinaryCases(queryParams)` - Fetch cases with pagination
- `useDisciplinaryCase(id)` - Fetch single case
- `useDisciplinaryStats()` - Fetch case statistics
- `useActiveDisciplinaryCases()` - Fetch active cases

## 📝 Data Validation

All data is validated using Zod schemas in `/src/lib/validations.ts`:

- `memberSchema` - Member data validation
- `eventSchema` - Event data validation
- `disciplinaryCaseSchema` - Disciplinary case validation
- `communicationSchema` - Communication validation
- `membershipCardSchema` - Membership card validation
- `loginSchema` - Login validation

## 🎯 Key Features

1. **Role-based Access Control** - Different permission levels for different user roles
2. **Data Validation** - Comprehensive validation using Zod
3. **Real-time Updates** - SWR provides automatic revalidation
4. **Server-side Rendering** - Full SSR support with Next.js App Router
5. **Database Migrations** - Drizzle handles schema migrations
6. **Type Safety** - Full TypeScript support throughout
7. **Responsive Design** - Mobile-first design with Tailwind CSS

## 🚀 Deployment

### Production Environment Variables

Make sure to set these in your production environment:

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

# Generate database migrations
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## 📚 API Endpoints

The system provides RESTful API endpoints:

- `GET /api/members` - List members
- `GET /api/members/[id]` - Get single member
- `GET /api/events` - List events
- `GET /api/events/[id]` - Get single event
- `GET /api/disciplinary` - List disciplinary cases
- `GET /api/disciplinary/[id]` - Get single disciplinary case

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `DATABASE_URL` in `.env.local`
   - Ensure your Neon database is active

2. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check that default users are created

3. **Build Errors**
   - Run `npm run db:generate` to ensure schema is up to date
   - Check TypeScript errors with `npm run lint`

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure the database schema is properly migrated
4. Check that all dependencies are installed

## 🎉 Next Steps

After completing the setup:

1. Test the authentication flow by logging in
2. Create some test members through the UI
3. Set up events and test RSVP functionality
4. Test the disciplinary case management
5. Configure communication settings
6. Set up membership card generation

The system is now ready for development and testing!