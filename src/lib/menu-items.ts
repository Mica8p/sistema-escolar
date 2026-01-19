import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  Package,
  Megaphone,
  ClipboardList, // Ahora se usará abajo
  UserCheck      // Ahora se usará abajo
} from "lucide-react";

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
      { title: "Asignación Docente", href: "/dashboard/profesores", roles: ["ADMIN"] },
      // Al usar el nombre aquí, el import dejará de estar en gris
      {
        title: "Calificaciones",
        href: "/dashboard/calificaciones",
        icon: ClipboardList,
        roles: ["ADMIN", "DOCENTE"]
      },
      {
        title: "Asistencias",
        href: "/dashboard/asistencias",
        icon: UserCheck,
        roles: ["ADMIN", "DOCENTE"]
      },
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