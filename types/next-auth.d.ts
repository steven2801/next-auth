import NextAuth, { DefaultSession, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      balance: number;
    } & DefaultSession["user"];
  }

  interface User {
    balance: number;
    hashedPassword: any;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    user: {
      balance: number;
      hashedPassword: any;
    } & (User | AdapterUser);
  }
}
