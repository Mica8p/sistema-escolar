import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// 1. Rutas exclusivas de configuración (Solo Admin)
const ADMIN_ONLY = ["/dashboard/ciclos", "/dashboard/cursos", "/dashboard/materias", "/dashboard/periodos"];

// 2. Rutas de gestión académica (Admin y Docentes)
const ACADEMIC_ROUTES = ["/dashboard/asistencias", "/dashboard/calificaciones", "/dashboard/alumnos", "/dashboard/profesores"];

export default NextAuth(authConfig).auth((req) => {
  const { nextUrl } = req;
  const userRoles = req.auth?.user?.roles || [];

  const isAdmin = userRoles.includes("ADMIN");
  const isDocente = userRoles.includes("DOCENTE");

  const path = nextUrl.pathname;

  // REGLA DE ORO: Si es ADMIN, tiene paso libre a TODO
  if (isAdmin) {
    return NextResponse.next();
  }

  // 3. Protección para rutas de configuración
  // Si no es admin e intenta entrar a ciclos, cursos, etc., vuelve al inicio.
  if (ADMIN_ONLY.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 4. Protección para rutas académicas
  // Solo permitimos entrar si es DOCENTE. (El Admin ya pasó arriba)
  if (ACADEMIC_ROUTES.some(route => path.startsWith(route)) && !isDocente) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};