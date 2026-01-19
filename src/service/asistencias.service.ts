import db from "@/lib/db";
import { EstadoAsistencia } from "@prisma/client";

// 1. Traer los horarios de una materia elegida
export async function getHorariosByAsignacion(idAsignacion: number) {
  return db.horario.findMany({
    where: { idAsignacion: Number(idAsignacion) },
    // Ordenamos por hora para que la lista sea profesional
    orderBy: { horaInicio: "asc" },
  });
}

// 2. Traer alumnos y su asistencia para un día y horario específico
export async function getPlanillaAsistencia(params: {
  idAsignacion: number;
  idHorario: number;
  fecha: Date;
}) {
  // NORMALIZACIÓN: Usamos el mismo criterio que en la Action
  const fechaBusqueda = new Date(params.fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);

  const asig = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: Number(params.idAsignacion) },
    include: { curso: true, ciclo: true, materia: true },
  });

  if (!asig) throw new Error("Asignación no encontrada");

  // Alumnos activos en el ciclo 2026
  const matriculas = await db.matricula.findMany({
    where: {
      idCurso: asig.idCurso,
      idCiclo: asig.idCiclo,
      estadoAcademico: "Activo"
    },
    include: { alumno: { include: { persona: true } } },
    orderBy: { alumno: { persona: { apellido: "asc" } } },
  });

  // Buscamos asistencias registradas para ese bloque y fecha
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