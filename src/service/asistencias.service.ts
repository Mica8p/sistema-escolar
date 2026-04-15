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
  page?: number;
  search?: string;
}) {
  const PAGE_SIZE = 5;
  const isFullList = params.page === 0; // Si page es 0, obtener todos
  const skip = isFullList ? 0 : ((params.page || 1) - 1) * PAGE_SIZE;
  
  const fechaBusqueda = new Date(params.fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);

  const asig = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: Number(params.idAsignacion) },
    include: { curso: true, ciclo: true, materia: true },
  });

  if (!asig) throw new Error("Asignación no encontrada");

  const whereClause: Prisma.MatriculaWhereInput = {
    idCurso: asig.idCurso,
    idCiclo: asig.idCiclo,
    estadoAcademico: "Activo"
  };

  if (params.search) {
    whereClause.alumno = {
      OR: [
        { persona: { nombre: { contains: params.search, mode: 'insensitive' } } },
        { persona: { apellido: { contains: params.search, mode: 'insensitive' } } },
        { persona: { dni: { contains: params.search, mode: 'insensitive' } } }
      ]
    };
  }

  const totalMatriculas = await db.matricula.count({ where: whereClause });

  const matriculas = await db.matricula.findMany({
    where: whereClause,
    include: { alumno: { include: { persona: true } } },
    orderBy: { alumno: { persona: { apellido: "asc" } } },
    take: isFullList ? undefined : PAGE_SIZE,
    skip,
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

  return { asig, matriculas, asistenciaByMatricula, totalMatriculas };
}