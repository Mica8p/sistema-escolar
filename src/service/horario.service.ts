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

  return db.horario.create({
    data: {
      idAsignacion,
      diaSemana: diaSemana as DiaSemana,
      horaInicio, // Se guarda como "08:00"
      horaFin,    // Se guarda como "09:20"
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
