import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import LinkedInProvider from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_GOOGLE_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_GOOGLE_SECRET",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "MOCK_TWITTER_ID",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "MOCK_TWITTER_SECRET",
      version: "2.0", // opt-in to Twitter OAuth 2.0
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "MOCK_LINKEDIN_ID",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "MOCK_LINKEDIN_SECRET",
      authorization: { params: { scope: 'r_liteprofile w_member_social' } },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
