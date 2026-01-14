import { LayoutDashboard, Users, BookOpen, Wallet, Package, Megaphone, Calendar } from "lucide-react";

export const menuItems = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "DOCENTE", "ALUMNO", "PADRE"],
  },
  {
  title: "Personas",
  href: "/dashboard/personas",
  icon: Users,
  roles: ["ADMIN"],
  },
  {
    title: "Alumnos",
    href: "/dashboard/alumnos",
    icon: Users,
    roles: ["ADMIN", "DOCENTE"],
  },
  {
    title: "Académico",
    href: "/dashboard/academico",
    icon: BookOpen,
    roles: ["ADMIN", "DOCENTE"],
  },
  {
    title: "Cursos",
    href: "/dashboard/cursos",
    icon: BookOpen,
    roles: ["ADMIN"],
  },
  {
    title: "Materias",
    href: "/dashboard/materias",
    icon: BookOpen,
    roles: ["ADMIN"],
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