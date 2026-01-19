import db from "@/lib/db";
import { EstadoAsistencia } from "@prisma/client";

// 1. Traer los horarios de una materia elegida
export async function getHorariosByAsignacion(idAsignacion: number) {
  return db.horario.findMany({
    where: { idAsignacion: Number(idAsignacion) },
    orderBy: { diaSemana: "asc" },
  });
}

// 2. Traer alumnos y su asistencia para un día y horario específico
export async function getPlanillaAsistencia(params: {
  idAsignacion: number;
  idHorario: number;
  fecha: Date;
}) {
  // 1. Normalizamos la fecha (sin horas) para la búsqueda exacta
  const fechaBusqueda = new Date(params.fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);

  // 2. Buscamos la asignación para saber curso y ciclo (2026/2027)
  const asig = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: Number(params.idAsignacion) },
    include: { curso: true, ciclo: true, materia: true },
  });

  if (!asig) throw new Error("Asignación no encontrada");

  // 3. Obtenemos alumnos inscriptos
  const matriculas = await db.matricula.findMany({
    where: {
      idCurso: asig.idCurso,
      idCiclo: asig.idCiclo,
      estadoAcademico: "Activo"
    },
    include: { alumno: { include: { persona: true } } },
    orderBy: { alumno: { persona: { apellido: "asc" } } },
  });

  // 4. Buscamos asistencias usando idHorario (como pide el nuevo schema)
  const asistencias = await db.asistencia.findMany({
    where: {
      idHorario: Number(params.idHorario), // Ahora TypeScript reconocerá este campo
      fecha: fechaBusqueda,
    },
  });

  const asistenciaByMatricula = new Map<number, (typeof asistencias)[number]>();
  for (const a of asistencias) {
    asistenciaByMatricula.set(a.idMatricula, a);
  }

  return { asig, matriculas, asistenciaByMatricula };
}