import db from "@/lib/db";
import { EstadoAsistencia } from "@prisma/client";

// 1. Traer los horarios de una materia elegida
export async function getHorariosByAsignacion(idAsignacion: number) {
  return db.horario.findMany({
    where: { idAsignacion },
    orderBy: { diaSemana: "asc" },
  });
}

// 2. Traer alumnos y su asistencia para un día y horario específico
export async function getPlanillaAsistencia(params: {
  idAsignacion: number;
  idHorario: number;
  fecha: Date;
}) {
  // Buscamos la materia para saber el curso
  const asig = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: params.idAsignacion },
    include: { curso: true, ciclo: true, materia: true },
  });

  if (!asig) throw new Error("Asignación no encontrada");

  // Alumnos inscritos
  const matriculas = await db.matricula.findMany({
    where: { idCurso: asig.idCurso, idCiclo: asig.idCiclo, estadoAcademico: "Activo" },
    include: { alumno: { include: { persona: true } } },
    orderBy: { alumno: { persona: { apellido: "asc" } } },
  });

  // Asistencias ya cargadas ese día en ese horario
  const asistencias = await db.asistencia.findMany({
    where: {
      idHorario: params.idHorario,
      fecha: params.fecha,
    },
  });

  // Mapeamos para que la tabla lo entienda rápido
  const asistenciaByMatricula = new Map<number, (typeof asistencias)[number]>();
  for (const a of asistencias) {
    asistenciaByMatricula.set(a.idMatricula, a);
  }

  return { asig, matriculas, asistenciaByMatricula };
}