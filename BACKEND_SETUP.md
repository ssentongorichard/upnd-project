# UPND Membership System - Backend Setup Guide

This guide will help you set up the complete backend infrastructure for the UPND Membership System using **Next.js 15**, **Neon PostgreSQL**, **Drizzle ORM**, **NextAuth**, **Server Actions**, **SWR**, and **Zod**.

## 🚀 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5
- **Data Fetching**: SWR (Stale-While-Revalidate)
- **Validation**: Zod
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- A Neon account (https://neon.tech)
- Git installed

## 🛠️ Setup Instructions

### Step 1: Database Setup (Neon)

1. **Create a Neon Account**
   - Go to https://neon.tech
   - Sign up for a free account
   - Create a new project

2. **Get Database Connection String**
   - In your Neon dashboard, navigate to your project
   - Go to "Connection Details"
   - Copy the connection string (it will look like: `postgresql://username:password@host.region.neon.tech/dbname?sslmode=require`)

### Step 2: Environment Variables

1. **Update `.env.local` file** (already created in the root directory)

```bash
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=your_neon_connection_string_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Generate NEXTAUTH_SECRET**
   ```bash
   openssl rand -base64 32
   ```
   Or use: https://generate-secret.vercel.app/32

### Step 3: Install Dependencies

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Step 4: Database Migration

1. **Generate migration files** (if schema changes are made)
   ```bash
   npm run db:generate
   ```

2. **Push schema to database**
   ```bash
   npm run db:push
   ```

3. **Verify database** (optional - opens Drizzle Studio)
   ```bash
   npm run db:studio
   ```
   This will open a web interface at http://localhost:4983

### Step 5: Create Initial Admin User

You'll need to create an admin user manually in the database. You can do this via Drizzle Studio or directly in your Neon console:

```sql
INSERT INTO users (id, name, email, password, role, jurisdiction, level, is_active, party_position)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@upnd.zm',
  -- Password: 'upnd2024' hashed with bcrypt
  '$2a$10$example_hash_replace_with_actual_hash',
  'National Admin',
  'National',
  'National',
  true,
  'System Administrator'
);
```

To generate a password hash:
```javascript
// Run this in a Node.js console or create a script
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your_password', 10);
console.log(hash);
```

### Step 6: Run the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## 📁 Project Structure

```
src/
├── app/
│   ├── actions/           # Server Actions
│   │   ├── auth.ts
│   │   ├── members.ts
│   │   ├── events.ts
│   │   ├── disciplinary.ts
│   │   ├── communications.ts
│   │   └── membership-cards.ts
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   └── ...
├── components/           # React Components
├── context/              # React Context
├── db/
│   ├── index.ts          # Database client
│   └── schema.ts         # Drizzle schema
├── hooks/                # Custom React Hooks (with SWR)
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── validations.ts    # Zod schemas
│   └── utils.ts
├── types/                # TypeScript types
└── middleware.ts         # Route protection
```

## 🔐 Authentication Flow

### Login
1. User enters credentials on login page
2. NextAuth validates against database
3. JWT token is created and stored in httpOnly cookie
4. User is redirected to dashboard

### Protected Routes
- All routes except `/`, `/register`, and `/success` require authentication
- Admin routes (`/admin/*`) require Admin role
- Middleware checks authentication status and role

### API Usage
Server actions automatically have access to the session via `getServerSession(authOptions)`

## 📊 Database Schema

### Core Tables
- **users** - Authentication and user roles
- **members** - UPND member information
- **events** - Party events and rallies
- **event_rsvps** - Event attendance tracking
- **disciplinary_cases** - Disciplinary actions
- **communications** - Mass communications
- **communication_recipients** - Communication delivery tracking
- **membership_cards** - Digital membership cards

### NextAuth Tables
- **accounts** - OAuth accounts
- **sessions** - User sessions
- **verification_tokens** - Email verification

## 🔄 Server Actions

### Members
- `getMembers(filters)` - Fetch members with filters
- `getMemberById(id)` - Get single member
- `createMember(data)` - Register new member
- `updateMember(id, data)` - Update member info
- `updateMemberStatus(data)` - Update approval status
- `bulkApprovemembers(ids)` - Approve multiple members
- `getMemberStatistics()` - Get member stats

### Events
- `getEvents(filters)` - Fetch events
- `createEvent(data)` - Create new event
- `updateEvent(id, data)` - Update event
- `deleteEvent(id)` - Delete event
- `createOrUpdateRsvp(data)` - RSVP to event
- `checkInMember(eventId, memberId)` - Check in attendee

### Disciplinary
- `getDisciplinaryCases(filters)` - Fetch cases
- `createDisciplinaryCase(data)` - Create new case
- `updateDisciplinaryCase(id, data)` - Update case
- `deleteDisciplinaryCase(id)` - Delete case

### Communications
- `getCommunications(filters)` - Fetch communications
- `createCommunication(data)` - Create new communication
- `sendCommunication(id)` - Send communication

### Membership Cards
- `getMembershipCards(filters)` - Fetch cards
- `createMembershipCard(data)` - Issue new card
- `renewMembershipCard(id)` - Renew card
- `getExpiringCards()` - Get cards expiring soon

## 🎣 React Hooks with SWR

All data fetching hooks use SWR for automatic caching and revalidation:

```typescript
// Example: useMembers hook
const { members, loading, error, addMember, updateMember } = useMembers({
  status: 'Approved',
  province: 'Lusaka'
});
```

Features:
- Automatic revalidation on focus
- Periodic refresh (30-60 seconds)
- Optimistic UI updates
- Error handling
- Loading states

## ✅ Data Validation with Zod

All server actions validate input data using Zod schemas:

```typescript
// Example: Member registration
const validatedData = memberRegistrationSchema.parse(data);
```

Validation schemas in `src/lib/validations.ts` ensure:
- Type safety
- Data integrity
- Clear error messages
- Business rule enforcement

## 🔒 Security Features

1. **Authentication**
   - Secure password hashing (bcrypt)
   - JWT tokens (httpOnly cookies)
   - Session management

2. **Authorization**
   - Role-based access control
   - Route protection middleware
   - Server-side permission checks

3. **Data Validation**
   - Input sanitization
   - Schema validation
   - SQL injection prevention (Drizzle ORM)

4. **Database**
   - SSL connection to Neon
   - Parameterized queries
   - Connection pooling

## 📱 API Endpoints

### NextAuth
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Server Actions (All POST)
Server actions are called directly from React components and don't have traditional REST endpoints.

## 🧪 Testing the Setup

1. **Test Database Connection**
   ```bash
   npm run db:studio
   ```
   Verify all tables are created.

2. **Test Authentication**
   - Navigate to http://localhost:3000
   - Try logging in with test credentials
   - Verify redirect to dashboard

3. **Test Member Registration**
   - Go to http://localhost:3000/register
   - Fill out the form
   - Check database for new member

## 🚨 Common Issues & Solutions

### Issue: "DATABASE_URL is not set"
**Solution**: Make sure `.env.local` exists and contains valid DATABASE_URL

### Issue: NextAuth "No secret provided"
**Solution**: Generate and set NEXTAUTH_SECRET in `.env.local`

### Issue: Database tables don't exist
**Solution**: Run `npm run db:push` to create tables

### Issue: "Cannot find module '@/...'"
**Solution**: Restart TypeScript server in your IDE

### Issue: SWR not fetching data
**Solution**: Make sure server actions are marked with 'use server' directive

## 📈 Performance Optimization

1. **Database**
   - Indexes on frequently queried columns
   - Connection pooling with Neon
   - Query optimization with Drizzle

2. **Caching**
   - SWR automatic caching
   - Next.js static generation where possible
   - Revalidation strategies

3. **Server Actions**
   - Parallel data fetching
   - Optimistic updates
   - Background revalidation

## 🔄 Deployment

### Prepare for Production

1. **Update Environment Variables**
   ```bash
   DATABASE_URL=production_neon_url
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=strong_production_secret
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel (Recommended)**
   - Connect GitHub repository
   - Add environment variables
   - Deploy

### Post-Deployment
1. Run database migrations if needed
2. Create admin users
3. Test all functionality
4. Monitor error logs

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [SWR Documentation](https://swr.vercel.app/)
- [Zod Documentation](https://zod.dev/)
- [Neon Documentation](https://neon.tech/docs)

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check database connectivity
4. Verify environment variables

## 📝 Next Steps

After completing the setup:

1. ✅ Database is connected and migrated
2. ✅ Authentication is working
3. ✅ Server actions are functional
4. ✅ Data fetching with SWR is operational
5. ✅ Validation is in place

You can now:
- Start developing features
- Customize the schema
- Add new server actions
- Enhance the UI
- Deploy to production

---

**Note**: This system is production-ready but should be reviewed for your specific security and scalability requirements before deploying to a live environment.
