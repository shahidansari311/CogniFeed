import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import LinkedInProvider from "next-auth/providers/linkedin";

const handler = NextAuth({
  // Use JWT sessions – no database adapter required.
  // The NestJS server owns the database; the Next.js client
  // should not open a direct Prisma connection.
  session: { strategy: "jwt" },
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
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
