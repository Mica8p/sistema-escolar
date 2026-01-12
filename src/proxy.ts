// src/middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Ajustamos el matcher para evitar que Next.js se confunda
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};