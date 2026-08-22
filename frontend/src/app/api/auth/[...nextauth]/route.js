import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, account }) {
      // Only runs once, right after Google sign-in
      if (account?.id_token) {
        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          });

          if (!res.ok) throw new Error("Backend auth exchange failed");

          const data = await res.json();

          return {
            ...token,
            id_token: data.access_token, // NOTE: now holds OUR backend JWT, not Google's
            error: undefined,
          };
        } catch (err) {
          console.error("Error exchanging Google token for backend JWT:", err);
          return { ...token, error: "BackendAuthError" };
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.id_token = token.id_token; // backend JWT, valid 30 days
      session.error = token.error;
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