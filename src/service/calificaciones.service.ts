import db from "@/lib/db";
import { TipoEvaluacion } from "@prisma/client";
import { getCicloActual } from "@/lib/ciclo-session";

export async function getAsignacionesParaUsuario(params: {
  isAdmin: boolean;
  idPersona: number;
  idCiclo: number; // <--- PASO 1: Agregamos el idCiclo como parámetro obligatorio
}) {
  // PASO 2: Borramos la línea "const idCiclo = await getCicloActual()"
  // porque ahora el ID nos llega por el parámetro 'params.idCiclo'

  if (params.isAdmin) {
    return db.asignacionAcademica.findMany({
      where: {
        idCiclo: params.idCiclo // <--- PASO 3: Filtramos usando el parámetro
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
      idCiclo: params.idCiclo // <--- PASO 4: Filtramos usando el parámetro
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
  // 1. Buscamos la asignación para conocer el Curso y el Ciclo
  const asig = await db.asignacionAcademica.findUnique({
    where: { idAsignacion: params.idAsignacion },
    include: { curso: true, ciclo: true, materia: true }
  });

  if (!asig) throw new Error("Asignación no encontrada");

  // 2. Buscamos las matrículas filtrando por Curso Y Ciclo
  const matriculas = await db.matricula.findMany({
    where: {
      idCurso: asig.idCurso,
      idCiclo: asig.idCiclo, // <--- ESTE ES EL FILTRO MAESTRO
      estadoAcademico: "Activo"
    },
    include: {
      alumno: {
        include: { persona: true }
      }
    },
    orderBy: { alumno: { persona: { apellido: "asc" } } }
  });

  // 3. Traemos las notas ya cargadas para esa instancia
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
