import db from "@/lib/db";
import { EstadoAsistencia } from "@prisma/client";


export async function getHorariosByAsignacion(idAsignacion: number) {
  return db.horario.findMany({
    where: { idAsignacion: Number(idAsignacion) },
    orderBy: { horaInicio: "asc" },
  });
}

export async function getHorariosByAsignaciones(idAsignaciones: number[]) {
  if (idAsignaciones.length === 0) return [];
  return db.horario.findMany({
    where: { idAsignacion: { in: idAsignaciones } },
    orderBy: { horaInicio: "asc" },
  });
}

export async function getPlanillaAsistencia(params: {
  idAsignacion: number;
  idHorario: number;
  fecha: Date;
}) {
  const fechaBusqueda = new Date(params.fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);

  const asig = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: Number(params.idAsignacion) },
    include: { curso: true, ciclo: true, materia: true },
  });

  if (!asig) throw new Error("Asignación no encontrada");

  const matriculas = await db.matricula.findMany({
    where: {
      idCurso: asig.idCurso,
      idCiclo: asig.idCiclo,
      estadoAcademico: "Activo"
    },
    include: { alumno: { include: { persona: true } } },
    orderBy: { alumno: { persona: { apellido: "asc" } } },
  });

  const asistencias = await db.asistencia.findMany({
    where: {
      idHorario: Number(params.idHorario),
      fecha: fechaBusqueda,
    },
  });

  const asistenciaByMatricula = new Map<number, (typeof asistencias)[number]>();
  for (const a of asistencias) {
    asistenciaByMatricula.set(a.idMatricula, a);
  }

  return { asig, matriculas, asistenciaByMatricula };
}