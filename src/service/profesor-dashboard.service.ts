import db from "@/lib/db";
import { getCicloActual } from "@/lib/ciclo-session";
import { EstadoAcademico, PeriodoNombre, DiaSemana } from "@prisma/client";

function getDayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(24, 0, 0, 0);
  return { start, end };
}

function getDiaSemanaEnum(date = new Date()): DiaSemana {
  const map: DiaSemana[] = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
  ];
  return map[date.getDay()];
}

/**
 * Clases de hoy del docente (solo ciclo actual)
 */
export async function getClasesDeHoyDocente(idProfesor: number, date = new Date()) {
  const idCiclo = await getCicloActual();
  const dia = getDiaSemanaEnum(date);

  return db.horario.findMany({
    where: {
      diaSemana: dia,
      asignacion: {
        idProfesor,
        idCiclo,
        estado: true,
      },
    },
    orderBy: [{ horaInicio: "asc" }],
    include: {
      asignacion: {
        include: { materia: true, curso: true, ciclo: true },
      },
    },
  });
}

/**
 * Asistencias pendientes reales:
 * compara total de matriculas activas vs asistencias cargadas hoy
 * (solo ciclo actual)
 */
export async function getAsistenciasPendientesDocente(idProfesor: number, date = new Date()) {
  const idCiclo = await getCicloActual();
  const dia = getDiaSemanaEnum(date);
  const { start, end } = getDayRange(date);

  const horariosHoy = await db.horario.findMany({
    where: {
      diaSemana: dia,
      asignacion: {
        idProfesor,
        idCiclo,
        estado: true,
      },
    },
    include: {
      asignacion: { include: { materia: true, curso: true, ciclo: true } },
    },
    orderBy: [{ horaInicio: "asc" }],
  });

  const pendientes = [];

  for (const h of horariosHoy) {
    const idCurso = h.asignacion.idCurso;

    const [totalAlumnos, asistenciasCargadas] = await Promise.all([
      db.matricula.count({
        where: {
          idCurso,
          idCiclo,
          estadoAcademico: EstadoAcademico.Activo,
        },
      }),
      db.asistencia.count({
        where: {
          idHorario: h.idHorario,
          fecha: { gte: start, lt: end },
        },
      }),
    ]);

    if (asistenciasCargadas < totalAlumnos) {
      pendientes.push({
        horario: h,
        totalAlumnos,
        asistenciasCargadas,
        faltan: totalAlumnos - asistenciasCargadas,
      });
    }
  }

  return pendientes;
}

/**
 * Notas recientes cargadas por el docente (solo ciclo actual)
 */
export async function getNotasRecientesDocente(idProfesor: number, take = 8) {
  const idCiclo = await getCicloActual();

  return db.nota.findMany({
    where: {
      asignacion: {
        idProfesor,
        idCiclo,
        estado: true,
      },
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      asignacion: { include: { materia: true, curso: true } },
      periodo: true,
      matricula: { include: { alumno: { include: { persona: true } } } },
    },
  });
}

/**
 * Próximos cierres del ciclo actual (DICIEMBRE / FEBRERO / JULIO_PREVIAS)
 * Solo del ciclo actual
 */
export async function getProximosCierresDocente(idProfesor: number, take = 5) {
  const idCiclo = await getCicloActual();
  const ahora = new Date();

  // ya lo filtramos por idCiclo
  return db.periodoAcademico.findMany({
    where: {
      idCiclo,
      fechaInicio: { gte: ahora },
      nombre: {
        in: [
          PeriodoNombre.DICIEMBRE,
          PeriodoNombre.FEBRERO,
          PeriodoNombre.JULIO_PREVIAS,
        ],
      },
      // Filtro opcional: asegura que el profe tenga asignaciones en ese ciclo
      ciclo: { asignaciones: { some: { idProfesor, idCiclo, estado: true } } },
    },
    orderBy: { fechaInicio: "asc" },
    take,
    include: { ciclo: true },
  });
}
