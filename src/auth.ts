import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import db from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type { User } from "next-auth";

// User extendido SOLO para authorize()
type AppUser = User & {
  roles: string[];
  idUsuario: number;
  idPersona: number;
  idProfesor?: number | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.dni || !credentials?.password) return null;

        const usuario = await db.usuario.findFirst({
          where: { persona: { dni: credentials.dni as string } },
          include: {
            persona: true,
            roles: { include: { rol: true } },
          },
        });

        if (!usuario || !usuario.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          usuario.passwordHash
        );
        if (!isPasswordValid) return null;

        // Si existe profesor para esa persona, guardamos idProfesor
        const prof = await db.profesor.findUnique({
          where: { idPersona: usuario.idPersona },
          select: { idProfesor: true },
        });

        return {
          id: String(usuario.idUsuario), // Auth.js espera string
          name: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
          email: usuario.persona.email ?? null,

          roles: usuario.roles.map((r) => r.rol.nombre),
          idUsuario: usuario.idUsuario,
          idPersona: usuario.idPersona,
          idProfesor: prof?.idProfesor ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // En el primer login, user viene (siempre) desde authorize()
      if (user) {
        const u = user as AppUser;

        token.roles = u.roles;
        token.idUsuario = u.idUsuario;
        token.idPersona = u.idPersona;
        token.idProfesor = u.idProfesor ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      
      session.user.roles = (token.roles as string[]) ?? [];
      session.user.idUsuario = (token.idUsuario as JWT["idUsuario"]) ?? null;
      session.user.idPersona = (token.idPersona as JWT["idPersona"]) ?? null;
      session.user.idProfesor = (token.idProfesor as JWT["idProfesor"]) ?? null;

      return session;
    },
  },
});
