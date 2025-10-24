import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: string;
      jurisdiction?: string;
      level?: string;
      partyPosition?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: string;
    jurisdiction?: string;
    level?: string;
    partyPosition?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
    jurisdiction?: string;
    level?: string;
    partyPosition?: string;
  }
}
