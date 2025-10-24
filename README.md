# UPND Membership System

A comprehensive membership management system for the United Party for National Development (UPND) built with modern web technologies.

## 🚀 Quick Start

See [QUICK_START.md](./QUICK_START.md) for a 5-minute setup guide.

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 5 minutes
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Complete backend documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What's been implemented

## ✨ Features

- 👥 Member registration and management
- 🎫 Event management and RSVP tracking
- ⚖️ Disciplinary case management
- 📧 Mass communication system
- 💳 Digital membership cards
- 📊 Analytics and reporting
- 🔐 Role-based access control
- 🌍 Geographic mapping

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Drizzle ORM
- **Database**: Neon (Serverless PostgreSQL)
- **Authentication**: NextAuth.js
- **Data Fetching**: SWR
- **Validation**: Zod

## 🎯 Getting Started

1. **Clone and Install**
   \`\`\`bash
   git clone git@github.com:ssentongorichard/upnd-project.git
   cd upnd-project
   npm install
   \`\`\`

2. **Setup Database**
   - Create account at https://neon.tech
   - Copy your database URL
   - Update \`.env.local\`

3. **Initialize**
   \`\`\`bash
   npm run db:push
   npm run create-admin
   npm run dev
   \`\`\`

4. **Login**
   - Visit http://localhost:3000
   - Email: admin@upnd.zm
   - Password: upnd2024

## 📖 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run db:push\` - Push schema to database
- \`npm run db:studio\` - Open database GUI
- \`npm run create-admin\` - Create admin user

## 🔐 Default Credentials

**Admin User:**
- Email: admin@upnd.zm
- Password: upnd2024

**Change this password immediately after first login!**

## 📱 Features

### Member Management
- Public registration portal
- Multi-level approval workflow
- Profile management
- Geographic tracking
- Search and filtering

### Event Management
- Event creation and scheduling
- RSVP tracking
- Attendance check-in
- Event statistics

### Disciplinary System
- Case management
- Severity levels
- Investigation tracking
- Resolution workflows

### Communications
- SMS and Email
- Targeted messaging
- Delivery tracking
- Bulk communications

### Reports & Analytics
- Member statistics
- Geographic distribution
- Trend analysis
- Export capabilities

## 🏗️ Project Structure

\`\`\`
src/
├── app/
│   ├── actions/         # Server Actions
│   ├── api/             # API routes
│   ├── dashboard/       # Dashboard pages
│   └── ...
├── components/          # React components
├── db/
│   ├── schema.ts        # Database schema
│   └── index.ts         # DB client
├── hooks/               # Custom hooks with SWR
├── lib/                 # Utilities
└── types/               # TypeScript types
\`\`\`

## 🔒 Security

- Password hashing with bcrypt
- JWT session management
- Role-based access control
- SQL injection prevention
- XSS protection
- CSRF protection
- SSL database connections

## 🌐 Deployment

Ready to deploy to:
- Vercel (recommended)
- Netlify
- AWS
- DigitalOcean

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for deployment guide.

## 📝 License

Copyright © 2024 UPND

## 🤝 Contributing

This is a private project for UPND internal use.

## 📞 Support

For technical support or questions:
1. Check documentation files
2. Review error logs
3. Contact system administrator

---

**Built with ❤️ for Unity, Work, Progress**
