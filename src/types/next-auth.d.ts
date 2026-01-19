import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      roles: string[];
      idUsuario: number;
      idPersona: number;
      idProfesor: number | null;
      idPadre: number | null; // Agregamos el ID del padre
    } & DefaultSession["user"];
  }

  interface User {
    roles: string[];
    idUsuario: number;
    idPersona: number;
    idProfesor: number | null;
    idPadre: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles: string[];
    idUsuario: number;
    idPersona: number;
    idProfesor: number | null;
    idPadre: number | null;
  }
}
