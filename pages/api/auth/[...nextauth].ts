import bcrypt from "bcrypt";
import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("invalid-credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("invalid-credentials");
        }

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isCorrectPassword) {
          throw new Error("invalid-credentials");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user, account }) => {
      if (user.email) {
        const userWithSameEmail = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
          select: {
            accounts: {
              select: {
                provider: true,
              },
            },
          },
        });

        // if user with same email exists and it's not the same provider
        if (userWithSameEmail && account?.provider !== userWithSameEmail.accounts[0].provider) {
          throw new Error("same-email");
        }

        return true;
      }

      return false;
    },
    jwt: async ({ token, user }) => {
      user && (token.user = user);

      if (user) {
        token.user = {
          ...user,
          hashedPassword: undefined,
        };
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user as DefaultSession["user"];

      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  // debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
