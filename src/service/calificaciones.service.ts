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
