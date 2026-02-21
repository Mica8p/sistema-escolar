import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// 1. Rutas exclusivas para el Administrador
const ADMIN_ONLY = [
  "/dashboard/ciclos",
  "/dashboard/cursos",
  "/dashboard/materias",
  "/dashboard/periodos",
  "/dashboard/inventario"
];

// 2. Rutas académicas (Administrador y Docentes)
const ACADEMIC_ROUTES = [
  "/dashboard/asistencias",
  "/dashboard/calificaciones",
  "/dashboard/alumnos",
  "/dashboard/profesores"
];

export default NextAuth(authConfig).auth((req) => {
  const { nextUrl } = req;
  const userRoles = req.auth?.user?.roles || [];

  const isAdmin = userRoles.includes("ADMIN");
  const isDocente = userRoles.includes("DOCENTE");
  const esPadre = userRoles.includes("PADRE");

  const path = nextUrl.pathname;

  //El Administrador tiene acceso total
  if (isAdmin) {
    return NextResponse.next();
  }

  const esRutaBoletin = path.startsWith("/dashboard/alumnos/") && path.endsWith("/boletin");
  if (esRutaBoletin && esPadre) {
    return NextResponse.next();
  }

  const esRutaDetalleAsistencia = path.startsWith("/dashboard/asistencias/") && path.length > "/dashboard/asistencias/".length;
  if (esRutaDetalleAsistencia && esPadre) {
    return NextResponse.next();
  }

  if (ADMIN_ONLY.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (ACADEMIC_ROUTES.some(route => path.startsWith(route)) && !isDocente) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};