import { auth } from "@/auth";
import { getAsignacionesParaUsuario } from "@/service/calificaciones.service";
import { getCicloActual } from "@/lib/ciclo-session";
import { Materia, Turno } from "@prisma/client";
import { getEstadisticasAsistenciasPorMateriaAction } from "@/lib/actions/asistencias-actions";
import { redirect } from "next/navigation";
import AsistenciasReportClient from "./AsistenciasReportClient";

export default async function AsistenciasReportePage({
  searchParams
}: {
  searchParams: Promise<{ curso?: string; turno?: Turno; mat?: string; }>;
}) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  // Solo admin puede acceder a este reporte
  if (!session.user.roles.includes("ADMIN")) {
    redirect("/dashboard/asistencias");
  }

  const idCiclo = await getCicloActual();
  const isAdmin = session.user.roles.includes("ADMIN");
  const idPersona = session.user.idPersona ?? 0;

  const asignaciones = await getAsignacionesParaUsuario({ isAdmin, idPersona, idCiclo });

  const cursosAgrupados = asignaciones.reduce((acc, a) => {
    const key = `${a.curso.grado}° ${a.curso.seccion}`;
    if (!acc[key]) {
      acc[key] = {
        idCurso: a.idCurso,
        grado: a.curso.grado,
        seccion: a.curso.seccion,
        turnos: new Set<Turno>()
      };
    }
    acc[key].turnos.add(a.curso.turno);
    return acc;
  }, {} as Record<string, { idCurso: number; grado: string; seccion: string; turnos: Set<Turno> }>);

  const cursos = Object.values(cursosAgrupados).map(c => ({ ...c, turnos: Array.from(c.turnos) }));

  const idCurso = params.curso ? Number(params.curso) : (cursos[0]?.idCurso || 0);
  const selectedCursoInfo = cursos.find(c => c.idCurso === idCurso);
  
  const turno = params.turno || (selectedCursoInfo?.turnos[0] || 'Mañana');

  const materiasUnicas = asignaciones
    .filter(a => a.curso.grado === selectedCursoInfo?.grado && a.curso.seccion === selectedCursoInfo?.seccion && a.curso.turno === turno)
    .reduce((acc, a) => {
      if (!acc.find(m => m.idMateria === a.materia.idMateria)) {
        acc.push(a.materia);
      }
      return acc;
    }, [] as Materia[]);

  const idMateria = params.mat ? Number(params.mat) : (materiasUnicas[0]?.idMateria || 0);

  // Obtener estadísticas de asistencia por materia
  const estadisticas = idMateria > 0 
    ? await getEstadisticasAsistenciasPorMateriaAction(idCurso, idMateria, idCiclo)
    : [];

  return (
    <AsistenciasReportClient
      cursos={cursos}
      idCurso={idCurso}
      turno={turno}
      materiasUnicas={materiasUnicas}
      idMateria={idMateria}
      estadisticas={estadisticas}
    />
  );
}
