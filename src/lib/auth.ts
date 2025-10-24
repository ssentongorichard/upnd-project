import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          });

          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          if (!user.isActive) {
            throw new Error('Account is inactive');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'Member',
            jurisdiction: user.jurisdiction,
            level: user.level,
            partyPosition: user.partyPosition,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.jurisdiction = user.jurisdiction;
        token.level = user.level;
        token.partyPosition = user.partyPosition;
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.jurisdiction = token.jurisdiction as string;
        session.user.level = token.level as string;
        session.user.partyPosition = token.partyPosition as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Helper functions for permissions
export const permissions: Record<string, string[]> = {
  'National Admin': [
    'view_all',
    'approve_all',
    'manage_users',
    'generate_reports',
    'export_data',
    'approve_members',
    'system_settings',
    'manage_disciplinary',
    'manage_events',
  ],
  'Provincial Admin': [
    'view_province',
    'approve_members',
    'manage_province_users',
    'generate_reports',
    'export_data',
    'manage_districts',
    'manage_branches',
    'manage_officials',
    'manage_events',
    'view_performance',
    'manage_disciplinary',
  ],
  'District Admin': [
    'view_district',
    'approve_members',
    'manage_district_users',
    'generate_reports',
    'manage_constituencies',
    'manage_events',
  ],
  'Constituency Admin': [
    'view_constituency',
    'approve_members',
    'manage_constituency_users',
    'generate_reports',
    'manage_wards',
    'manage_events',
  ],
  'Ward Admin': [
    'view_ward',
    'approve_members',
    'manage_ward_users',
    'generate_reports',
    'manage_branches',
    'manage_events',
  ],
  'Branch Admin': [
    'view_branch',
    'approve_members',
    'manage_branch_users',
    'generate_reports',
    'manage_sections',
    'manage_events',
  ],
  'Section Admin': ['view_section', 'review_applications', 'generate_reports'],
  Member: ['view_profile', 'update_profile'],
};

export function hasPermission(userRole: string, permission: string): boolean {
  const userPermissions = permissions[userRole] || [];
  return userPermissions.includes(permission);
}
