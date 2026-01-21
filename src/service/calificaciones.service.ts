import db from "@/lib/db";
import { TipoEvaluacion } from "@prisma/client";
import { getCicloActual } from "@/lib/ciclo-session";

export async function getAsignacionesParaUsuario(params: {
  isAdmin: boolean;
  idPersona: number;
  idCiclo: number;
}) {

  if (params.isAdmin) {
    return db.asignacionAcademica.findMany({
      where: {
        idCiclo: params.idCiclo
      },
      include: { curso: true, materia: true, ciclo: true },
      orderBy: [{ idCiclo: "desc" }, { idCurso: "asc" }],
    });
  }

  const prof = await db.profesor.findUnique({
    where: { idPersona: params.idPersona },
    select: { idProfesor: true },
  });

  if (!prof) return [];

  return db.asignacionAcademica.findMany({
    where: {
      idProfesor: prof.idProfesor,
      idCiclo: params.idCiclo
    },
    include: { curso: true, materia: true, ciclo: true },
    orderBy: [{ idCiclo: "desc" }, { idCurso: "asc" }],
  });
}

/**
 * Trae los periodos (Trimestres/Etapas) de un año lectivo.
 */
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
}) {
  const asig = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: params.idAsignacion },
    include: { curso: true, ciclo: true, materia: true }
  });

  if (!asig) throw new Error("Asignación no encontrada");

  const matriculas = await db.matricula.findMany({
    where: {
      idCurso: asig.idCurso,
      idCiclo: asig.idCiclo,
      estadoAcademico: "Activo"
    },
    include: {
      alumno: {
        include: { persona: true }
      }
    },
    orderBy: { alumno: { persona: { apellido: "asc" } } }
  });

  const notas = await db.nota.findMany({
    where: {
      idAsignacion: params.idAsignacion,
      idPeriodo: params.idPeriodo,
      tipo: params.tipo as any,
    },
  });

  // Mapeo para que la tabla lo procese rápido
  const notaByMatricula = new Map<number, number>();
  notas.forEach((n) => notaByMatricula.set(n.idMatricula, n.nota));

  return { asig, matriculas, notaByMatricula };
}


export async function guardarNota(params: {
  idMatricula: number;
  idAsignacion: number;
  idPeriodo: number;
  tipo: TipoEvaluacion;
  nota: number;
  observacion?: string | null;
}) {
  // Primero necesitamos saber el contexto de esta asignación
  const asigActual = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: params.idAsignacion },
    select: { idMateria: true, idCurso: true, idCiclo: true }
  });

  if (!asigActual) throw new Error("Asignación no válida");

  // Buscamos si ya existe una nota para este alumno/periodo en esta materia
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
    // Si ya existe, actualizamos (sin importar quién la creó originalmente)
    return db.nota.update({
      where: { idNota: existente.idNota },
      data: {
        nota: params.nota,
        observacion: params.observacion ?? null,
        idAsignacion: params.idAsignacion, // Queda registrado quién hizo la última edición
        fechaRegistro,
      },
    });
  }

  // Si no existe, se crea de cero
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
          materia: true // Para mostrar "Matemática", "Lengua", etc.
        }
      },
      periodo: true // Para saber si es "1° Trimestre", "Examen Final", etc.
    },
    orderBy: [
      { asignacion: { materia: { nombre: 'asc' } } },
      { periodo: { fechaInicio: 'asc' } },
      { fechaRegistro: 'desc' }
    ]
  });
}
