import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { Provider } from 'next-auth/providers';

// Define types for the user and token
type User = {
  id: string;
  email: string;
  name: string | null;
  username: string;
  isAdmin: boolean;
  password: string;
};

type AuthUser = {
  id: string;
  email: string;
  name: string;
  username: string;
  isAdmin: boolean;
};

const providers: Provider[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = (await prisma.user.findUnique({
        where: { email: credentials.email as string },
      })) as User | null;

      if (!user) {
        return null;
      }

      const passwordValid = await bcrypt.compare(credentials.password as string, user.password);

      if (!passwordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || '',
        username: user.username,
        isAdmin: user.isAdmin,
      };
    },
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === 'function') {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== 'credentials');

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-123',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = (user as AuthUser).username;
        token.isAdmin = (user as AuthUser).isAdmin;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: (token.name as string) || '',
          username: token.username as string,
          isAdmin: token.isAdmin as boolean,
        };
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
});
