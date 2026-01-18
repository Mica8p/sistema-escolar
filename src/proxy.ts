import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// 1. Definimos las rutas que solo el ADMIN puede gestionar
const ADMIN_ROUTES = [
  "/dashboard/ciclos",
  "/dashboard/cursos",
  "/dashboard/materias",
  "/dashboard/periodos",
];

export default NextAuth(authConfig).auth((req) => {
  const { nextUrl } = req;
  const userRoles = req.auth?.user?.roles || [];
  const isAdmin = userRoles.includes("ADMIN");

  // 2. Verificamos si el usuario intenta acceder a una ruta de administración
  const isTargetingAdminRoute = ADMIN_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // 3. Lógica de Redirección: Si es docente y entra a zona admin, vuelve al panel principal
  if (isTargetingAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Este matcher asegura que el middleware corra en casi toda la app
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};