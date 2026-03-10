import db from "@/lib/db";
import { Turno, TipoEvaluacion, Prisma, Nota } from '@prisma/client';

interface GetAsignacionesParams {
  isAdmin: boolean;
  idPersona: number;
  idCiclo: number;
  grado?: string;
  seccion?: string;
  turno?: Turno;
}

export async function getAsignacionesParaUsuario(params: GetAsignacionesParams) {
  const whereClause: Prisma.AsignacionAcademicaWhereInput = {
    idCiclo: params.idCiclo,
    estado: true,
  };

  const cursoWhere: Prisma.CursoWhereInput = {};

  if (params.grado && params.seccion) {
    cursoWhere.grado = params.grado;
    cursoWhere.seccion = params.seccion;
  }

  if (params.turno) {
    cursoWhere.turno = params.turno;
  }

  if (Object.keys(cursoWhere).length > 0) {
    whereClause.curso = cursoWhere;
  }

  if (params.isAdmin) {
    return db.asignacionAcademica.findMany({
      where: whereClause,
      include: {
        curso: true,
        materia: true,
        ciclo: true
      },
      orderBy: [
        {
          idCiclo: "desc"
        },
        {
          idCurso: "asc"
        }
      ]
    });
  }

  const prof = await db.profesor.findUnique({
    where: { idPersona: params.idPersona },
    select: { idProfesor: true },
  });

  if (!prof) return [];
  whereClause.idProfesor = prof.idProfesor;

  return db.asignacionAcademica.findMany({
    where: whereClause,
    include: { curso: true, materia: true, ciclo: true },
    orderBy: [{ idCiclo: "desc" }, { idCurso: "asc" }],
  });
}

export async function getPeriodosByCiclo(idCiclo: number) {
  return db.periodoAcademico.findMany({
    where: { idCiclo },
    orderBy: { fechaInicio: "asc" },
  });
}


export async function getPlanilla(params: {
  idAsignacion: number;
  idPeriodo: number;
  tipo: string;
  page: number;
  search?: string;
}) {
  const PAGE_SIZE = 5;
  const skip = (params.page - 1) * PAGE_SIZE;

  const asig = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: params.idAsignacion },
    include: { curso: true, ciclo: true, materia: true }
  });

  if (!asig) throw new Error("Asignación no encontrada");

  const whereClause: Prisma.MatriculaWhereInput = {
    idCurso: asig.idCurso,
    idCiclo: asig.idCiclo,
    estadoAcademico: "Activo" as const
  };

  if (params.search) {
    whereClause.alumno = {
      OR: [
        { persona: { nombre: { contains: params.search, mode: 'insensitive' } } },
        { persona: { apellido: { contains: params.search, mode: 'insensitive' } } },
        { persona: { dni: { contains: params.search } } }
      ]
    };
  }

  const totalMatriculas = await db.matricula.count({ where: whereClause });

  const matriculas = await db.matricula.findMany({
    where: whereClause,
    include: {
      alumno: { include: { persona: true } }
    },
    orderBy: { alumno: { persona: { apellido: "asc" } } },
    take: PAGE_SIZE,
    skip,
  });

  const todasLasNotas = await db.nota.findMany({
    where: {
      asignacion: {
        idMateria: asig.idMateria,
        idCurso: asig.idCurso,
        idCiclo: asig.idCiclo
      }
    },
    include: {
      periodo: true,
      asignacion: { include: { profesor: { include: { persona: true } } } }
    }
  });

  const notaByMatricula = new Map<number, Nota>();
  todasLasNotas
    .filter((n: Nota) => n.idPeriodo === params.idPeriodo && n.tipo === params.tipo)
    .forEach((n: Nota) => notaByMatricula.set(n.idMatricula, n));

  return { asig, matriculas, notaByMatricula, historialNotas: todasLasNotas, totalMatriculas };
}


export async function guardarNota(params: {
  idMatricula: number;
  idAsignacion: number;
  idPeriodo: number;
  tipo: TipoEvaluacion;
  nota: number;
  observacion?: string | null;
}) {
  const periodo = await db.periodoAcademico.findUnique({
    where: { idPeriodo: params.idPeriodo },
    select: { cerrado: true }
  });

  if (periodo?.cerrado) {
    throw new Error("Operación no permitida: El periodo académico se encuentra cerrado.");
  }

  const asigActual = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: params.idAsignacion },
    select: { idMateria: true, idCurso: true, idCiclo: true }
  });

  if (!asigActual) throw new Error("Asignación no válida");

  const existente = await db.nota.findFirst({
    where: {
      idMatricula: params.idMatricula,
      idPeriodo: params.idPeriodo,
      tipo: params.tipo,
      asignacion: {
        idMateria: asigActual.idMateria,
        idCurso: asigActual.idCurso,
        idCiclo: asigActual.idCiclo
      }
    },
  });

  const fechaRegistro = new Date();

  if (existente) {
    return db.nota.update({
      where: { idNota: existente.idNota },
      data: {
        nota: params.nota,
        observacion: params.observacion ?? null,
        idAsignacion: params.idAsignacion,
        fechaRegistro,
      },
    });
  }

  return db.nota.create({
    data: {
      idMatricula: params.idMatricula,
      idAsignacion: params.idAsignacion,
      idPeriodo: params.idPeriodo,
      tipo: params.tipo,
      nota: params.nota,
      observacion: params.observacion ?? null,
      fechaRegistro,
    },
  });
}

export async function getCalificacionesHijo(idAlumno: number, idCiclo: number) {
  return await db.nota.findMany({
    where: {
      matricula: {
        idAlumno: idAlumno,
        idCiclo: idCiclo
      }
    },
    include: {
      asignacion: {
        include: {
          materia: true
        }
      },
      periodo: true
    },
    orderBy: [
      { asignacion: { materia: { nombre: 'asc' } } },
      { periodo: { fechaInicio: 'asc' } },
      { fechaRegistro: 'desc' }
    ]
  });
}

/**
 * Valida si hay notas faltantes para un período específico
 * @returns { ok: boolean, mensaje?: string, notasFaltantes?: Array }
 */
export async function validarNotasFaltantesPeriodo(idPeriodo: number) {
  try {
    // Obtener el período y su ciclo asociado
    const periodo = await db.periodoAcademico.findUnique({
      where: { idPeriodo },
      include: { ciclo: true }
    });

    if (!periodo) {
      return { ok: false, mensaje: "Período no encontrado" };
    }

    // Obtener todas las matrículas activas del ciclo
    const matriculas = await db.matricula.findMany({
      where: {
        idCiclo: periodo.idCiclo,
        estadoAcademico: "Activo"
      },
      include: {
        alumno: { include: { persona: true } },
        curso: true
      }
    });

    // Obtener todas las asignaciones activas del ciclo
    const asignaciones = await db.asignacionAcademica.findMany({
      where: {
        idCiclo: periodo.idCiclo,
        estado: true
      },
      include: { materia: true, profesor: { include: { persona: true } } }
    });

    // Por cada combinación de matrícula x asignación, verificar si hay nota
    const notasFaltantes: any[] = [];

    for (const matricula of matriculas) {
      // Solo revisar asignaciones del curso del alumno
      const asignacionesCurso = asignaciones.filter(
        a => a.idCurso === matricula.idCurso
      );

      for (const asignacion of asignacionesCurso) {
        // Verificar si existe nota de cualquier tipo para este período
        const nota = await db.nota.findFirst({
          where: {
            idMatricula: matricula.idMatricula,
            idAsignacion: asignacion.idAsignacion,
            idPeriodo: idPeriodo
          }
        });

        if (!nota) {
          notasFaltantes.push({
            alumno: `${matricula.alumno.persona.apellido}, ${matricula.alumno.persona.nombre}`,
            materia: asignacion.materia.nombre,
            profesor: asignacion.profesor 
              ? `${asignacion.profesor.persona.apellido}, ${asignacion.profesor.persona.nombre}`
              : "Sin asignar"
          });
        }
      }
    }

    if (notasFaltantes.length > 0) {
      // Agrupar por profesor
      const porProfesor = new Map<string, any[]>();
      for (const faltante of notasFaltantes) {
        const key = faltante.profesor;
        if (!porProfesor.has(key)) {
          porProfesor.set(key, []);
        }
        porProfesor.get(key)!.push(`${faltante.alumno} - ${faltante.materia}`);
      }

      let mensaje = "Faltan notas para los siguientes alumnos:\n\n";
      for (const [profesor, notas] of porProfesor) {
        mensaje += `\n📌 ${profesor}:\n`;
        notas.slice(0, 3).forEach(nota => mensaje += `  • ${nota}\n`);
        if (notas.length > 3) {
          mensaje += `  ... y ${notas.length - 3} más\n`;
        }
      }

      return {
        ok: false,
        mensaje,
        notasFaltantes: notasFaltantes.length
      };
    }

    return { ok: true, mensaje: "Todas las notas están cargadas" };
  } catch (error) {
    console.error("Error validando notas:", error);
    return { ok: false, mensaje: "Error al validar notas" };
  }
}

/**
 * Obtiene un resumen de las notificaciones de notas pendientes para un docente,
 * para mostrar directamente en su dashboard.
 * No crea comunicados en la base de datos, solo devuelve la información.
 */
export async function getDocenteDashboardPendingNotifications(idProfesor: number, idCiclo: number) {
  const notifications: {
    periodoNombre: string;
    diasFaltantes: number;
    asignacionesPendientes: {
      materia: string;
      curso: string;
      idAsignacion: number;
    }[];
  }[] = [];

  try {
    const periodosAbiertos = await db.periodoAcademico.findMany({
      where: {
        idCiclo: idCiclo,
        cerrado: false,
      },
      orderBy: { fechaFin: "asc" },
    });

    const ahora = new Date();

    for (const periodo of periodosAbiertos) {
      const diasFaltantes = Math.ceil(
        (periodo.fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Solo considerar períodos que cierran en 1 o 2 días
      if (diasFaltantes < 1 || diasFaltantes > 2) {
        continue;
      }

      // Obtener todas las asignaciones activas de este profesor en este ciclo
      const asignacionesDelProfesor = await db.asignacionAcademica.findMany({
        where: {
          idCiclo: idCiclo,
          idProfesor: idProfesor,
          estado: true,
        },
        include: {
          materia: true,
          curso: true,
        },
      });

      const asignacionesConNotasPendientes: { materia: string; curso: string; idAsignacion: number }[] = [];

      for (const asignacion of asignacionesDelProfesor) {
        // Obtener todas las matrículas activas para el curso de esta asignación
        const matriculasCurso = await db.matricula.findMany({
          where: {
            idCurso: asignacion.idCurso,
            idCiclo: idCiclo,
            estadoAcademico: "Activo",
          },
          select: { idMatricula: true },
        });

        let hasMissingNotes = false;
        for (const matricula of matriculasCurso) {
          // Verificar si existe una nota para esta matrícula, asignación y período
          const notaExistente = await db.nota.findFirst({
            where: {
              idMatricula: matricula.idMatricula,
              idAsignacion: asignacion.idAsignacion,
              idPeriodo: periodo.idPeriodo,
            },
          });

          if (!notaExistente) {
            hasMissingNotes = true;
            break; // Se encontró una nota faltante, esta asignación tiene pendientes
          }
        }

        if (hasMissingNotes) {
          asignacionesConNotasPendientes.push({
            materia: asignacion.materia.nombre,
            curso: `${asignacion.curso.grado}° "${asignacion.curso.seccion}"`,
            idAsignacion: asignacion.idAsignacion,
          });
        }
      }

      if (asignacionesConNotasPendientes.length > 0) {
        notifications.push({
          periodoNombre: periodo.nombre,
          diasFaltantes: diasFaltantes,
          asignacionesPendientes: asignacionesConNotasPendientes,
        });
      }
    }
  } catch (error) {
    console.error("Error obteniendo notificaciones de dashboard para docente:", error);
  }

  return notifications;
}

export async function getBoletinCompleto(idMatricula: number) {
  if (!idMatricula || isNaN(idMatricula)) return null;
  return await db.matricula.findUnique({
    where: { idMatricula },
    include: {
      alumno: {
        include: { persona: true }
      },
      curso: true,
      ciclo: true,
      notas: {
        include: {
          asignacion: {
            include: { materia: true }
          },
          periodo: true
        }
      },
      asistencias: true
    }
  });
}
