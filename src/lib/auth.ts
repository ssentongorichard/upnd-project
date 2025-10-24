import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { users, accounts, sessions, verificationTokens } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validations';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Validate input
          const validatedFields = loginSchema.safeParse(credentials);
          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // Find user in database
          const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email),
          });

          if (!user) {
            return null;
          }

          // For now, we'll use a simple password check
          // In production, you should hash passwords and compare hashes
          if (password === 'upnd2024') {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              jurisdiction: user.jurisdiction,
              level: user.level,
              partyPosition: user.partyPosition,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.jurisdiction = user.jurisdiction;
        token.level = user.level;
        token.partyPosition = user.partyPosition;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.jurisdiction = token.jurisdiction as string;
        session.user.level = token.level as string;
        session.user.partyPosition = token.partyPosition as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};