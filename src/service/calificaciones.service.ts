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
  const isFullList = params.page === 0; // Si page es 0, obtener todos
  const skip = isFullList ? 0 : (params.page - 1) * PAGE_SIZE;

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
    take: isFullList ? undefined : PAGE_SIZE,
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
    select: { cerrado: true, nombre: true }
  });

  if (periodo?.cerrado) {
    throw new Error("Operación no permitida: El periodo académico se encuentra cerrado.");
  }

  const existente = await db.nota.findFirst({
    where: {
      idMatricula: params.idMatricula,
      idPeriodo: params.idPeriodo,
      tipo: params.tipo,
      idAsignacion: params.idAsignacion
    },
  });

  // ✅ Validación de bloqueo según instancia de recuperación
  if (periodo?.nombre === "DICIEMBRE") {
    // Bloquear si promedio trimestral >= 6
    const notasTrimestres = await db.nota.findMany({
      where: {
        idMatricula: params.idMatricula,
        idAsignacion: params.idAsignacion,
        periodo: { nombre: { in: ["TRIMESTRE_1", "TRIMESTRE_2", "TRIMESTRE_3"] } }
      }
    });
    
    const notas = notasTrimestres.map(n => Number(n.nota)).filter(n => n > 0);
    if (notas.length > 0) {
      const promedio = notas.reduce((a, b) => a + b, 0) / notas.length;
      if (promedio >= 6) {
        throw new Error('Operación no permitida: El alumno tiene promedio aprobatorio en trimestres.');
      }
    }
  } else if (periodo?.nombre === "FEBRERO") {
    // Bloquear si aprobó en diciembre
    const notaDiciembre = await db.nota.findFirst({
      where: {
        idMatricula: params.idMatricula,
        idAsignacion: params.idAsignacion,
        periodo: { nombre: "DICIEMBRE" }
      }
    });
    
    if (notaDiciembre && notaDiciembre.nota >= 6) {
      throw new Error('Operación no permitida: El alumno aprobó en diciembre.');
    }
  } else if (periodo?.nombre === "JULIO_PREVIAS") {
    // Bloquear si aprobó en febrero
    const notaFebrero = await db.nota.findFirst({
      where: {
        idMatricula: params.idMatricula,
        idAsignacion: params.idAsignacion,
        periodo: { nombre: "FEBRERO" }
      }
    });
    
    if (notaFebrero && notaFebrero.nota >= 6) {
      throw new Error('Operación no permitida: El alumno aprobó en febrero.');
    }
  }

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
    select: {
      idNota: true,
      nota: true,
      tipo: true,
      observacion: true,
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
    const notasFaltantes: Array<{ alumno: string; materia: string; profesor: string }> = [];

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
      // Obtener profesores únicos que faltan cargar notas
      const profesoresUnicos = new Set<string>();
      for (const faltante of notasFaltantes) {
        profesoresUnicos.add(faltante.profesor);
      }

      let mensaje = "Los siguientes docentes deben cargar las notas para este período:\n\n";
      Array.from(profesoresUnicos).forEach((profesor, index) => {
        mensaje += `${index + 1}. ${profesor}\n`;
      });

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

      // Mostrar notificaciones para períodos que cierran en los próximos 10 días
      // diasFaltantes puede ser 0 (hoy), 1 (mañana), hasta 10 días
      if (diasFaltantes < 0 || diasFaltantes > 10) {
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
