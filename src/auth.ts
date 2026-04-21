import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import db from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { esDueñoTecnico } from "@/lib/security";

export class AccountDisabledError extends Error {
  constructor(message = "Tu cuenta está deshabilitada.") {
    super(message);
    this.name = "AccountDisabledError";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          if (!credentials?.dni || !credentials?.password) {
            console.error("[AUTH] Faltan credenciales");
            return null;
          }

          const usuario = await db.usuario.findFirst({
            where: { persona: { dni: credentials.dni as string } },
            include: {
              persona: true,
              roles: { include: { rol: true } },
            },
          });

          if (!usuario) {
            console.error(`[AUTH] Usuario con DNI ${credentials.dni} no encontrado`);
            return null;
          }

          if (!usuario.passwordHash) {
            console.error(`[AUTH] Usuario ${credentials.dni} no tiene passwordHash`);
            return null;
          }

          if (!usuario.estado) {
            console.error(`[AUTH] Usuario ${credentials.dni} está deshabilitado`);
            throw new AccountDisabledError();
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            usuario.passwordHash
          );
          if (!isPasswordValid) {
            console.error(`[AUTH] Contraseña inválida para ${credentials.dni}`);
            return null;
          }

          const isDefaultPassword = usuario.defaultPassword;

          const rolesArray = usuario.roles.map((r) => r.rol.nombre);

          // Filtrar roles: padres no pueden tener ADMIN
          const filteredRoles = rolesArray.filter((rol) => !(rolesArray.includes("PADRE") && rol === "ADMIN"));

          // ⭐ SEGURIDAD: Si es propietario técnico, asegurar rol SUPER_ADMIN
          if (esDueñoTecnico(usuario.persona.email)) {
            console.log(`[AUTH] 🔐 ${usuario.persona.email} es propietario técnico - Otorgando SUPER_ADMIN`);
            if (!filteredRoles.includes('SUPER_ADMIN')) {
              filteredRoles.push('SUPER_ADMIN');
            }
          }

          const [prof, padre] = await Promise.all([
            db.profesor.findUnique({ where: { idPersona: usuario.idPersona }, select: { idProfesor: true } }),
            filteredRoles.includes("PADRE")
              ? db.padre.findUnique({ where: { idPersona: usuario.idPersona }, select: { idPadre: true } })
              : null
          ]);

          console.log(`[AUTH] Login exitoso para ${credentials.dni}`);

          return {
            id: String(usuario.idUsuario),
            name: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
            email: usuario.persona.email ?? null,
            roles: filteredRoles,
            idUsuario: usuario.idUsuario,
            idPersona: usuario.idPersona,
            idProfesor: prof?.idProfesor ?? null,
            idPadre: padre?.idPadre ?? null,
            isDefaultPassword,
          };
        } catch (error) {
          console.error("[AUTH] Error en authorize:", error);
          throw error;
        }
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


      if (token.idUsuario) {
        const dbUser = await db.usuario.findUnique({
          where: { idUsuario: token.idUsuario as number },
          select: { defaultPassword: true },
        });
        if (dbUser) {
          token.isDefaultPassword = dbUser.defaultPassword;
        }
      }

      if (trigger === "update" && session?.isDefaultPassword === false) {
        token.isDefaultPassword = false;
      }
      return token;
    },
    async session({ session, token }) {
      const typedToken = token as { roles?: string[]; idUsuario?: number; idPersona?: number; idProfesor?: number | null; idPadre?: number | null; isDefaultPassword?: boolean };
      session.user.roles = typedToken.roles ?? [];
      session.user.idUsuario = typedToken.idUsuario ?? 0;
      session.user.idPersona = typedToken.idPersona ?? 0;
      session.user.idProfesor = typedToken.idProfesor ?? null;
      session.user.idPadre = typedToken.idPadre ?? null;
      session.user.isDefaultPassword = typedToken.isDefaultPassword ?? false;
      return session;
    },
  },
});