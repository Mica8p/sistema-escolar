import db from "@/lib/db";
import { TipoEvaluacion } from "@prisma/client";

export async function getAsignacionesParaUsuario(params: {
  isAdmin: boolean;
  idPersona: number;
}) {
  if (params.isAdmin) {
    return db.asignacionAcademica.findMany({
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
    where: { idProfesor: prof.idProfesor },
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
  tipo: TipoEvaluacion;
}) {
  const asig = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: params.idAsignacion },
    include: { curso: true, ciclo: true, materia: true },
  });
  if (!asig) throw new Error("Asignación no encontrada.");

  const matriculas = await db.matricula.findMany({
    where: {
      idCurso: asig.idCurso,
      idCiclo: asig.idCiclo,
      estadoAcademico: "Activo",
    },
    include: {
      alumno: { include: { persona: true } },
    },
    orderBy: [{ alumno: { persona: { apellido: "asc" } } }],
  });

  const notas = await db.nota.findMany({
    where: {
      idAsignacion: params.idAsignacion,
      idPeriodo: params.idPeriodo,
      tipo: params.tipo,
    },
    orderBy: { updatedAt: "desc" },
  });

  const notaByMatricula = new Map<number, (typeof notas)[number]>();
  for (const n of notas) {
    if (!notaByMatricula.has(n.idMatricula)) notaByMatricula.set(n.idMatricula, n);
  }

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
  const existente = await db.nota.findFirst({
    where: {
      idMatricula: params.idMatricula,
      idAsignacion: params.idAsignacion,
      idPeriodo: params.idPeriodo,
      tipo: params.tipo,
    },
    orderBy: { updatedAt: "desc" },
  });

  const fechaRegistro = new Date();

  if (existente) {
    return db.nota.update({
      where: { idNota: existente.idNota },
      data: {
        nota: params.nota,
        observacion: params.observacion ?? null,
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
