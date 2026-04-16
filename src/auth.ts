import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import db from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export class AccountDisabledError extends AuthError {
  constructor(message = "Tu cuenta está deshabilitada.") {
    super(message);
    this.type = "AccountDisabled";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
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

        if (!usuario.estado) {
          throw new AccountDisabledError();
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          usuario.passwordHash
        );
        if (!isPasswordValid) return null;

        const isDefaultPassword = usuario.defaultPassword;

        const rolesArray = usuario.roles.map((r) => r.rol.nombre);

        // Filtrar roles: padres no pueden tener ADMIN
        const filteredRoles = rolesArray.filter((rol) => !(rolesArray.includes("PADRE") && rol === "ADMIN"));

        const [prof, padre] = await Promise.all([
          db.profesor.findUnique({ where: { idPersona: usuario.idPersona }, select: { idProfesor: true } }),
          filteredRoles.includes("PADRE")
            ? db.padre.findUnique({ where: { idPersona: usuario.idPersona }, select: { idPadre: true } })
            : null
        ]);

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