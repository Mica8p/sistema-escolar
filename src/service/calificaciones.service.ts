import db from "@/lib/db";
import { TipoEvaluacion } from "@prisma/client";

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
      idCiclo: params.idCiclo,
      estado: true
    },
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
      alumno: { include: { persona: true } }
    },
    orderBy: { alumno: { persona: { apellido: "asc" } } }
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

  const notaByMatricula = new Map<number, any>();
  todasLasNotas
    .filter(n => n.idPeriodo === params.idPeriodo && n.tipo === params.tipo)
    .forEach((n) => notaByMatricula.set(n.idMatricula, n));

  return { asig, matriculas, notaByMatricula, historialNotas: todasLasNotas };
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
