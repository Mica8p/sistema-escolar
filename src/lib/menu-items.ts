import { LayoutDashboard, Users, BookOpen, Wallet, Package, Megaphone, Briefcase } from "lucide-react";

export const menuItems = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "DOCENTE", "ALUMNO", "PADRE"],
  },
  {
    title: "Gestión de Personas",
    icon: Users,
    roles: ["ADMIN"],
    subItems: [
      { title: "Todas las Personas", href: "/dashboard/personas", roles: ["ADMIN"] },
      { title: "Alumnos / Inscripciones", href: "/dashboard/alumnos", roles: ["ADMIN", "DOCENTE"] },
    ],
  },
  {
    title: "Académico",
    icon: BookOpen,
    roles: ["ADMIN", "DOCENTE"],
    subItems: [
      { title: "Gestión de Cursos", href: "/dashboard/cursos", roles: ["ADMIN"] },
      { title: "Gestión de Materias", href: "/dashboard/materias", roles: ["ADMIN"] },
      { title: "Asignación Docente", href: "/dashboard/profesores", roles: ["ADMIN"] },
    ],
  },
  {
    title: "Pagos y Cuotas",
    href: "/dashboard/finanzas",
    icon: Wallet,
    roles: ["ADMIN", "PADRE"],
  },
  {
    title: "Inventario",
    href: "/dashboard/inventario",
    icon: Package,
    roles: ["ADMIN"],
  },
  {
    title: "Comunicados",
    href: "/dashboard/comunicados",
    icon: Megaphone,
    roles: ["ADMIN", "DOCENTE", "ALUMNO", "PADRE"],
  },
];