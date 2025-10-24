import { NextAuthOptions } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
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
          // For now, we'll use a simple check against mock data
          // In production, you'd check against the database
          const mockUsers = {
            'admin@upnd.zm': { id: '1', email: 'admin@upnd.zm', password: 'upnd2024', role: 'National Admin' },
            'provincial@upnd.zm': { id: '2', email: 'provincial@upnd.zm', password: 'upnd2024', role: 'Provincial Admin' },
            'district@upnd.zm': { id: '3', email: 'district@upnd.zm', password: 'upnd2024', role: 'District Admin' },
            'branch@upnd.zm': { id: '4', email: 'branch@upnd.zm', password: 'upnd2024', role: 'Branch Admin' }
          };

          const user = mockUsers[credentials.email as keyof typeof mockUsers];
          
          if (user && user.password === credentials.password) {
            return {
              id: user.id,
              email: user.email,
              role: user.role,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
