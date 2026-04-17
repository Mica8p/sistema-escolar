import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
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
      const userRoles = (user as { roles?: string[] } | undefined)?.roles;
      if (userRoles) {
        token.roles = userRoles;
      }
      return token;
    },
    async session({ session, token }) {
      const sessionUser = session.user as unknown as { roles?: string[]; [key: string]: unknown };
      const tokenRoles = (token as { roles?: string[] }).roles;
      if (tokenRoles) {
        sessionUser.roles = tokenRoles;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;