import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      roles: string[];
      idUsuario: number | null;
      idPersona: number | null;
      idProfesor: number | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: string[];
    idUsuario?: number | null;
    idPersona?: number | null;
    idProfesor?: number | null;
  }
}
