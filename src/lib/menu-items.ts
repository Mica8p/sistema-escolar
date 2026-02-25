import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  Package,
  Megaphone,
  ClipboardList,
  UserCheck,
  CalendarDays
} from "lucide-react";

export const menuItems = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "DOCENTE", "PADRE"],
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
      {
        title: "Horarios",
        href: "/dashboard/horarios",
        icon: CalendarDays,
        roles: ["ADMIN", "DOCENTE", "PADRE"]
      },
    ],
  },
  {
    title: "Pagos y Cuotas",
    icon: Wallet,
    roles: ["ADMIN", "PADRE"],
    subItems: [
      { title: "Estado de Cuentas", href: "/dashboard/finanzas", roles: ["ADMIN", "PADRE"]},
      { title: "Conceptos de Pago", href: "/dashboard/finanzas/conceptos", roles: ["ADMIN"] },
      {
        title: "Reporte de Deudores",
        href: "/dashboard/finanzas/reporte-deudores",
        roles: ["ADMIN"]
      },
    ]
  },
  {
    title: "Inventario",
    href: "/dashboard/inventario",
    icon: Package,
    roles: ["ADMIN"],
  },
  {
    title: "Comunicados",
    icon: Megaphone,
    roles: ["ADMIN", "DOCENTE", "PADRE"],
    subItems: [
      {
        title: "Bandeja de Entrada",
        href: "/dashboard/comunicados",
        roles: ["ADMIN", "DOCENTE", "PADRE"]
      },
      {
        title: "Mensajes Enviados",
        href: "/dashboard/comunicados/enviados",
        roles: ["ADMIN", "DOCENTE"]
      },
    ],
  },
]