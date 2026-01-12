
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import db from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // ELIMINAMOS EL ADAPTER.
  // Al usar JWT, no necesitamos que Auth.js gestione tablas de sesión.
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.dni || !credentials?.password) return null;

        const usuario = await db.usuario.findFirst({
          where: { persona: { dni: credentials.dni as string } },
          include: {
            persona: true,
            roles: { include: { rol: true } }
          },
        });

        if (!usuario || !usuario.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          usuario.passwordHash
        );

        if (!isPasswordValid) return null;

        // Retornamos el objeto que se guardará en el JWT
        return {
          id: usuario.idUsuario.toString(),
          name: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
          email: usuario.persona.email,
          roles: usuario.roles.map(r => r.rol.nombre),
        };
      },
    }),
  ],
});