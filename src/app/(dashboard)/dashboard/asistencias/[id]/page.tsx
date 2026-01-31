import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCicloActual } from "@/lib/ciclo-session";
import { getAsistenciaDetallada } from "@/service/padre.service";
import CalendarioAsistencia from "@/components/modules/padres/CalendariosAsistencia";
import { ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";
import db from "@/lib/db";

export default async function DetalleAsistenciaPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const idAlumno = parseInt(resolvedParams.id);
  const idCiclo = await getCicloActual();

  if (isNaN(idAlumno)) {
    redirect("/dashboard");
  }

  const alumno = await db.alumno.findUnique({
    where: { idAlumno },
    include: { persona: true }
  });

  if (!alumno) redirect("/dashboard");

  const asistencias = await getAsistenciaDetallada(idAlumno, idCiclo);

  return (
    <div className="p-8 bg-slate-100 min-h-screen space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Volver al panel familiar
        </Link>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-3">
          <UserCircle size={20} className="text-indigo-600" />
          <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
            {alumno.persona.nombre} {alumno.persona.apellido}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Historial de Asistencia</h1>
          <p className="text-slate-500 font-medium italic">
            Ciclo Lectivo 2026 • Detalle por materia
          </p>
        </div>

        <CalendarioAsistencia asistencias={asistencias} />
      </div>
    </div>
  );
}