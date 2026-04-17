import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import FirstLoginModal from "./FirstLoginModal";
import { getContadorNoLeidos } from "@/service/comunicado.service";
import db from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth().catch(() => null);

  if (!session) redirect("/login");

  const roles = session.user.roles || [];
  const idUsuario = session.user.idUsuario;
  const idPadre = session.user.idPadre;
  const shouldForceChange = session.user.isDefaultPassword;

  const rolPrincipal = roles[0] || "USUARIO";
  let idsCursosHijos: number[] = [];

  if (roles.includes("PADRE") && idPadre) {
    const relaciones = await db.alumnoPadre.findMany({
      where: { idPadre: idPadre },
      include: {
        alumno: {
          include: {
            matriculas: {
              where: { estadoAcademico: "Activo" },
              select: { idCurso: true }
            }
          }
        }
      }
    });
    idsCursosHijos = relaciones.flatMap(r => r.alumno.matriculas.map(m => m.idCurso));
  }

  const noLeidos = idUsuario
    ? await getContadorNoLeidos(idUsuario, rolPrincipal, idsCursosHijos)
    : 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRoles={roles} noLeidos={noLeidos} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header userName={session.user?.name} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
      <FirstLoginModal shouldForceChange={shouldForceChange} />
    </div>
  );
}