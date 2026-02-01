import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCicloActual } from "@/lib/ciclo-session";

import WelcomeHeader from "@/components/modules/dashboard/WelcomeHeader";
import AdminView from "@/components/modules/dashboard/AdminViex";
import DocenteView from "@/components/modules/dashboard/DocenteView";
import PadreView from "@/components/modules/dashboard/PadreView";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const roles = session.user.roles ?? [];
  const idCiclo = await getCicloActual();

  const esDocente = roles.includes("DOCENTE");
  const esPadre = roles.includes("PADRE");
  const esAdmin = roles.includes("ADMIN");

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen space-y-5">
      <WelcomeHeader
        name={session.user.name ?? "Usuario"}
        roles={roles}
      />

      {esDocente && (
        <DocenteView idProfesor={session.user.idProfesor ?? null} />
      )}

      {esPadre && (
        <PadreView
          idPersona={session.user.idPersona}
          idUsuario={session.user.idUsuario}
          idPadre={(session.user as any).idPadre}
          idCiclo={idCiclo}
        />
      )}

      {esAdmin && (
        <AdminView idCiclo={idCiclo} />
      )}
    </div>
  );
}