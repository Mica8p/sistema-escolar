// src/auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import db from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
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

        // Detectar si está usando la contraseña por defecto (DNI)
        const isDefaultPassword = String(credentials.password) === String(credentials.dni);

        const rolesArray = usuario.roles.map((r) => r.rol.nombre);

        // BUSQUEDA DE PERFILES ESPECIFICOS (Docente y Padre)
        const [prof, padre] = await Promise.all([
          db.profesor.findUnique({ where: { idPersona: usuario.idPersona }, select: { idProfesor: true } }),
          rolesArray.includes("PADRE")
            ? db.padre.findUnique({ where: { idPersona: usuario.idPersona }, select: { idPadre: true } })
            : null
        ]);

        return {
          id: String(usuario.idUsuario),
          name: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
          email: usuario.persona.email ?? null,
          roles: rolesArray,
          idUsuario: usuario.idUsuario,
          idPersona: usuario.idPersona,
          idProfesor: prof?.idProfesor ?? null,
          idPadre: padre?.idPadre ?? null, // Ahora idPadre viaja en la sesión
          isDefaultPassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.roles = user.roles;
        token.idUsuario = user.idUsuario;
        token.idPersona = user.idPersona;
        token.idProfesor = user.idProfesor;
        token.idPadre = user.idPadre;
        token.isDefaultPassword = user.isDefaultPassword;
      }
      // Permitir actualizar el token desde el cliente (cuando cambia la clave)
      if (trigger === "update" && session?.isDefaultPassword === false) {
        token.isDefaultPassword = false;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.roles = token.roles;
      session.user.idUsuario = token.idUsuario;
      session.user.idPersona = token.idPersona;
      session.user.idProfesor = token.idProfesor;
      session.user.idPadre = token.idPadre;
      session.user.isDefaultPassword = token.isDefaultPassword;
      return session;
    },
  },
});