import db from "@/lib/db";
import { TipoEvaluacion } from "@prisma/client";

/**
 * Trae las materias y cursos según el rol.
 * Si es ADMIN, trae todo. Si es PROFESOR, solo lo suyo.
 */
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
    where: { idProfesor: prof.idProfesor, estado: true }, // Solo traemos las activas para el docente
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

/**
 * Genera la planilla de alumnos y sus notas existentes.
 * CORRECCIÓN: Ahora busca notas por contexto académico (Materia/Curso)
 * para que el nuevo profesor vea lo que puso el anterior.
 */
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

  // Buscamos los alumnos inscritos en este curso y año
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

  // Buscamos notas por contexto de Materia/Curso/Ciclo (Herencia)
  const notas = await db.nota.findMany({
    where: {
      idPeriodo: params.idPeriodo,
      tipo: params.tipo,
      asignacion: {
        idMateria: asig.idMateria,
        idCurso: asig.idCurso,
        idCiclo: asig.idCiclo
      }
    },
    orderBy: { updatedAt: "desc" },
  });

  const notaByMatricula = new Map<number, (typeof notas)[number]>();
  for (const n of notas) {
    if (!notaByMatricula.has(n.idMatricula)) notaByMatricula.set(n.idMatricula, n);
  }

  return { asig, matriculas, notaByMatricula };
}

/**
 * Guarda o actualiza una calificación.
 * CORRECCIÓN: Si el profe nuevo edita una nota del profe viejo,
 * se actualiza la misma en lugar de crear una duplicada.
 */
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
