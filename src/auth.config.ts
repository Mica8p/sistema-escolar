// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  // ESTO ES LO QUE ARREGLA EL ERROR:
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.roles = (user as any).roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.roles) {
        (session.user as any).roles = token.roles as string[];
      }
      return session;
    },
  },
  providers: [], // Se llena en auth.ts
} satisfies NextAuthConfig;