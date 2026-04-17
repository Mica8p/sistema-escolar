import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      roles: string[];
      idUsuario: number;
      idPersona: number;
      idProfesor: number | null;
      idPadre: number | null;
      isDefaultPassword?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    roles: string[];
    idUsuario: number;
    idPersona: number;
    idProfesor: number | null;
    idPadre: number | null;
    isDefaultPassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles: string[];
    idUsuario: number;
    idPersona: number;
    idProfesor: number | null;
    idPadre: number | null;
    isDefaultPassword?: boolean;
  }
}
