# UPND Membership System - Quick Start Guide

## 🎯 Quick Setup (5 minutes)

### Step 1: Get Your Neon Database URL
1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy your connection string from the dashboard

### Step 2: Configure Environment Variables
1. Open `.env.local` in the root directory
2. Replace `DATABASE_URL` with your Neon connection string
3. Generate a secret key for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
   Or use: https://generate-secret.vercel.app/32

Your `.env.local` should look like:
```env
DATABASE_URL=postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Setup Database
```bash
# Push schema to database
npm run db:push
```

### Step 4: Create Admin User
```bash
# Install tsx if not already installed
npm install -g tsx

# Create admin user
npx tsx scripts/create-admin.ts
```

Default admin credentials:
- **Email**: admin@upnd.zm
- **Password**: upnd2024

### Step 5: Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000 and login with the admin credentials!

## 🎉 You're Done!

Your UPND Membership System is now fully functional with:
- ✅ PostgreSQL database (Neon)
- ✅ Authentication (NextAuth)
- ✅ Server Actions for CRUD operations
- ✅ Data fetching with SWR
- ✅ Form validation with Zod
- ✅ Protected routes
- ✅ Admin dashboard

## 🔍 What's Available?

### Public Routes
- `/` - Landing page & login
- `/register` - Member registration
- `/success` - Registration success page

### Protected Routes (Requires Login)
- `/dashboard` - Main dashboard
- `/admin` - Admin panel (Admin role only)

### Features
1. **Member Management**
   - Register new members
   - Approve/reject applications
   - View member details
   - Update member information

2. **Events Management**
   - Create party events
   - Track RSVPs
   - Check-in attendees

3. **Disciplinary System**
   - Report violations
   - Track cases
   - Manage resolutions

4. **Communications**
   - Send SMS/Email to members
   - Target specific groups
   - Track delivery

5. **Membership Cards**
   - Issue digital cards
   - Track expiry
   - Renewal management

6. **Reports & Analytics**
   - Member statistics
   - Provincial distribution
   - Event attendance
   - Export data

## 📊 Database Management

### View Database (Drizzle Studio)
```bash
npm run db:studio
```
Opens at http://localhost:4983

### Apply Schema Changes
```bash
npm run db:generate  # Generate migrations
npm run db:push      # Push to database
```

## 🔐 User Roles

- **National Admin** - Full system access
- **Provincial Admin** - Provincial level management
- **District Admin** - District level management
- **Branch Admin** - Branch level management
- **Section Admin** - Section level review
- **Member** - Basic member access

## 🛠️ Development Tips

### Adding New Server Actions
1. Create action file in `src/app/actions/`
2. Add 'use server' directive
3. Implement validation with Zod
4. Use getServerSession for auth
5. Return structured response: `{ success: boolean, data?: any, error?: string }`

### Creating New Hooks with SWR
```typescript
import useSWR from 'swr';
import { yourServerAction } from '@/app/actions/your-action';

export function useYourData() {
  const { data, error, isLoading } = useSWR(
    'your-key',
    yourServerAction,
    { refreshInterval: 30000 }
  );
  
  return { data, error, loading: isLoading };
}
```

### Adding Validation
Define schemas in `src/lib/validations.ts`:
```typescript
export const yourSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  // ... more fields
});
```

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update DATABASE_URL to production Neon URL
- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Run `npm run build` to test build
- [ ] Create production admin users
- [ ] Test all authentication flows
- [ ] Verify environment variables in hosting platform
- [ ] Enable SSL/HTTPS
- [ ] Set up error monitoring
- [ ] Configure backup strategy

## 📝 Common Tasks

### Add a New Admin User
```bash
npx tsx scripts/create-admin.ts
```

### Reset Database
```bash
# Careful: This will delete all data!
npm run db:push -- --force
npx tsx scripts/create-admin.ts
```

### Check Database Connection
```bash
npm run db:studio
```

## 🐛 Troubleshooting

### Can't connect to database
- Verify DATABASE_URL in .env.local
- Check Neon dashboard for connection string
- Ensure SSL mode is included: `?sslmode=require`

### NextAuth errors
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Server actions not working
- Ensure 'use server' directive is present
- Check console for validation errors
- Verify user authentication

### SWR not updating
- Check network tab for failed requests
- Verify server action returns success: true
- Try manual revalidation: `mutate(key)`

## 📚 Learn More

- Full documentation: `BACKEND_SETUP.md`
- Database schema: `src/db/schema.ts`
- Server actions: `src/app/actions/`
- API routes: `src/app/api/`

## 🆘 Need Help?

1. Check the error message carefully
2. Review `BACKEND_SETUP.md` for detailed docs
3. Verify all environment variables are set
4. Check database connection in Drizzle Studio
5. Review browser console for client-side errors

---

**Happy Coding! 🎉**

For detailed documentation, see `BACKEND_SETUP.md`
