import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account.id_token;
      }

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const modEmail = process.env.NEXT_PUBLIC_MOD_EMAIL;

      token.isAdmin =
        token.email === adminEmail ||
        token.email === modEmail;

      return token;
    },

    async session({ session, token }) {
      session.id_token = token.id_token;
      session.user.isAdmin = token.isAdmin;

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };