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
        include: {
          materia: true,
          curso: true,
        },
      },
    },
  });
}

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


export async function getProximosCierresDocente(idProfesor: number, take = 5) {
  const idCiclo = await getCicloActual();
  const ahora = new Date();

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
      ciclo: { asignaciones: { some: { idProfesor, idCiclo, estado: true } } },
    },
    orderBy: { fechaInicio: "asc" },
    take,
    include: { ciclo: true },
  });
}


/**
 * Calcula el % de asistencia promedio por curso del docente
 */

export async function getRendimientoAsistenciaDocente(idProfesor: number) {
  const idCiclo = await getCicloActual();

  const cursos = await db.curso.findMany({
    where: { asignaciones: { some: { idProfesor, idCiclo, estado: true } } },
    include: {
      asignaciones: {
        where: { idProfesor, idCiclo, estado: true },
        include: { horarios: { include: { asistencias: true } } }
      }
    }
  });

  return cursos.map(curso => {
    let presente = 0, ausente = 0, tarde = 0, justificado = 0;

    curso.asignaciones.forEach(asig => {
      asig.horarios.forEach(horario => {
        horario.asistencias.forEach(a => {
          if (a.estado === "Presente") presente++;
          else if (a.estado === "Ausente") ausente++;
          else if (a.estado === "Tarde") tarde++;
          else if (a.estado === "Justificado") justificado++;
        });
      });
    });

    return {
      name: `${curso.grado}° "${curso.seccion}"`,
      presente,
      ausente,
      tarde,
      justificado
    };
  });
}


export async function getComunicadosDashboard(idUsuario: number, idsCursos: number[]) {
  try {
    return await db.comunicado.findMany({
      where: {
        NOT: { idUsuario: idUsuario },
        OR: [
          { target: "TODOS" },
          { target: "DOCENTES" },
          {
            AND: [
              { idTarget: { in: idsCursos } },
              { target: { in: ["CURSO", "CURSO_DOCENTES"] } }
            ]
          }
        ]
      },
      take: 3,
      orderBy: {
        fecha: 'desc'
      },
      include: {
        vistos: {
          where: { idUsuario: idUsuario }
        }
      }
    });
  } catch (error) {
    console.error("Error en comunicados dashboard:", error);
    return [];
  }
}