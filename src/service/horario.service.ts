import { Horario, Turno, DiaSemana } from '@prisma/client';
import db from '@/lib/db';

export const getHorariosByAsignacionId = async (asignacionId: number): Promise<Horario[]> => {
  return db.horario.findMany({
    where: { idAsignacion: asignacionId },
    orderBy: { horaInicio: 'asc' }
  });
};

export const createHorario = async (data: {
  idAsignacion: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}): Promise<Horario> => {
  const { idAsignacion, diaSemana, horaInicio, horaFin } = data;

  const asignacion = await db.asignacion.findUnique({
    where: { idAsignacion },
    select: { idProfesor: true, idCiclo: true },
  });

  if (!asignacion || !asignacion.idProfesor) {
    throw new Error('Asignación o profesor no encontrados.');
  }

  const { idProfesor, idCiclo } = asignacion;

  const existingHorario = await db.horario.findFirst({
    where: {
      diaSemana: diaSemana as DiaSemana,
      horaInicio,
      asignacion: {
        idProfesor,
        idCiclo,
        estado: true,
      },
    },
  });

  if (existingHorario) {
    throw new Error('El profesor ya tiene un horario asignado en este bloque.');
  }

  return db.horario.create({
    data: {
      idAsignacion,
      diaSemana: diaSemana as DiaSemana,
      horaInicio,
      horaFin,
    },
  });
};

export const deleteHorario = async (horarioId: number): Promise<Horario> => {
  return db.horario.delete({
    where: { idHorario: horarioId },
  });
};

export const getHorariosPorCurso = async (idCurso: number, idCiclo: number) => {
  return db.horario.findMany({
    where: {
      asignacion: {
        idCurso: idCurso,
        idCiclo: idCiclo,
        estado: true,
      },
    },
    include: {
      asignacion: {
        include: {
          materia: true,
          profesor: {
            include: { persona: true }
          }
        },
      },
    },
    orderBy: [
      { horaInicio: 'asc' },
      { diaSemana: 'asc' }
    ],
  });
};

export async function getHorariosPorDocente(idProfesor: number, idCiclo: number) {
  return await db.horario.findMany({
    where: {
      asignacion: {
        idProfesor,
        idCiclo
      }
    },
    include: {
      asignacion: {
        include: {
          materia: true,
          curso: true,
          profesor: {
            include: { persona: true }
          }
        }
      }
    },
    orderBy: { horaInicio: 'asc' }
  });
}
export async function getHorarioConfig() {
  const [bloques, dias] = await Promise.all([
    db.bloqueHorario.findMany({ orderBy: { orden: 'asc' } }),
    db.diaHabil.findMany({ where: { habilitado: true }, orderBy: { orden: 'asc' } }),
  ]);
  return { bloques, dias };
}
