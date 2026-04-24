import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCicloActual } from "@/lib/ciclo-session";
import { esSuperAdmin } from "@/lib/security";

import SuperAdminView from "@/components/modules/dashboard/SuperAdminView";
import AdminView from "@/components/modules/dashboard/AdminViex";
import DocenteView from "@/components/modules/dashboard/DocenteView";
import PadreView from "@/components/modules/dashboard/PadreView";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const user = session.user;
  const roles = user.roles ?? [];
  const idCiclo = await getCicloActual();

  const esSuperAdminUser = esSuperAdmin(roles, user.email);
  const esDocente = roles.includes("DOCENTE");
  const esPadre = roles.includes("PADRE");
  const esAdmin = roles.includes("ADMIN");

  return (
    <div className="px-8 pb-8 bg-slate-50/50 min-h-screen space-y-2">

      {/* --- VISTA SUPER ADMINISTRADOR --- */}
      {esSuperAdminUser && (
        <SuperAdminView
          userName={user.name ?? "Super Admin"}
          currentUserEmail={user.email || undefined}
        />
      )}

      {/* --- VISTA DOCENTE --- */}
      {esDocente && (
        <DocenteView
          idProfesor={user.idProfesor ?? null}
          idUsuario={user.idUsuario}
          userName={user.name ?? "Docente"}
        />
      )}

      {/* --- VISTA PADRE --- */}
      {esPadre && (
        <PadreView
          idPersona={user.idPersona}
          idUsuario={user.idUsuario}
          idPadre={user.idPadre}
          idCiclo={idCiclo}
          userName={user.name ?? "Padre/Madre"}
        />
      )}

      {/* --- VISTA ADMINISTRADOR --- */}
      {esAdmin && !esSuperAdminUser && (
        <AdminView
          idCiclo={idCiclo}
          userName={user.name ?? "Admin"}
          idUsuario={user.idUsuario}
        />
      )}

    </div>
  );
}