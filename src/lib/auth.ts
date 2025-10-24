import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Demo users for credentials auth (replace with DB later)
const demoUsers = {
  'admin@upnd.zm': {
    id: '1',
    email: 'admin@upnd.zm',
    role: 'National Admin',
    name: 'Hakainde Hichilema',
    jurisdiction: 'National',
    level: 'National',
    isActive: true,
    partyPosition: 'National President'
  },
  'provincial@upnd.zm': {
    id: '2',
    email: 'provincial@upnd.zm',
    role: 'Provincial Admin',
    name: 'Cornelius Mweetwa',
    jurisdiction: 'Lusaka',
    level: 'Provincial',
    isActive: true,
    partyPosition: 'Provincial Chairperson'
  },
  'district@upnd.zm': {
    id: '3',
    email: 'district@upnd.zm',
    role: 'District Admin',
    name: 'Mutale Nalumango',
    jurisdiction: 'Lusaka District',
    level: 'District',
    isActive: true,
    partyPosition: 'District Chairperson'
  },
  'branch@upnd.zm': {
    id: '4',
    email: 'branch@upnd.zm',
    role: 'Branch Admin',
    name: 'Sylvia Masebo',
    jurisdiction: 'Kabwata Branch',
    level: 'Branch',
    isActive: true,
    partyPosition: 'Branch Chairperson'
  }
} as const;

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = demoUsers[credentials.email as keyof typeof demoUsers];
        if (user && credentials.password === 'upnd2024') {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            jurisdiction: user.jurisdiction,
            level: user.level,
            isActive: user.isActive,
            partyPosition: user.partyPosition
          } as any;
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.jurisdiction = (user as any).jurisdiction;
        token.level = (user as any).level;
        token.isActive = (user as any).isActive;
        token.partyPosition = (user as any).partyPosition;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...(session.user || {}),
        email: token.email,
        name: token.name,
        role: (token as any).role,
        jurisdiction: (token as any).jurisdiction,
        level: (token as any).level,
        isActive: (token as any).isActive,
        partyPosition: (token as any).partyPosition
      } as any;
      return session;
    }
  },
  pages: {
    signIn: '/admin'
  }
};

export default NextAuth(authOptions as any);
