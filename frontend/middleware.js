import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const modEmail = process.env.NEXT_PUBLIC_MOD_EMAIL;

    const isAdmin =
      token?.email === adminEmail ||
      token?.email === modEmail;

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/signin",
    },

    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/create-blog/:path*"],
};