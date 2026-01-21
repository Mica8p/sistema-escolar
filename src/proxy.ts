import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// 1. Rutas exclusivas para el Administrador (Configuración e Inventario)
const ADMIN_ONLY = [
  "/dashboard/ciclos",
  "/dashboard/cursos",
  "/dashboard/materias",
  "/dashboard/periodos",
  "/dashboard/inventario" // ✅ Nueva ruta blindada
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

  // REGLA DE ORO: El Administrador tiene acceso total a Escuela Pro
  if (isAdmin) {
    return NextResponse.next();
  }

  const esRutaDetalleAsistencia = path.startsWith("/dashboard/asistencias/") && path.length > "/dashboard/asistencias/".length;

  if (esRutaDetalleAsistencia && esPadre) {
    return NextResponse.next(); // ✅ Deja pasar al padre al detalle de su hijo
  }

  // Protección de rutas de configuración e inventario
  if (ADMIN_ONLY.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protección de rutas de gestión académica
  if (ACADEMIC_ROUTES.some(route => path.startsWith(route)) && !isDocente) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};