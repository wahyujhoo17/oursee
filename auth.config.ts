import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/fn-admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/fn-admin");
      const isOnLogin = nextUrl.pathname.startsWith("/fn-admin/login");

      if (isOnAdmin && !isOnLogin) {
        if (!isLoggedIn) return false;
        return true;
      }

      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/fn-admin/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
