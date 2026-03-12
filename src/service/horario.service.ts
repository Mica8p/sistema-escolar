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

  // Obtener todos los horarios del profesor en el mismo día y ciclo
  const horariosDelProfesor = await db.horario.findMany({
    where: {
      diaSemana: diaSemana as DiaSemana,
      asignacion: {
        idProfesor,
        idCiclo,
        estado: true,
      },
    },
    select: {
      horaInicio: true,
      horaFin: true,
      asignacion: {
        select: {
          curso: {
            select: {
              grado: true,
              seccion: true,
            }
          }
        }
      }
    }
  });

  // Verificar si hay solapamiento con algún horario existente
  for (const horario of horariosDelProfesor) {
    const existeInicio = horaInicio >= horario.horaInicio && horaInicio < horario.horaFin;
    const existeFin = horaFin > horario.horaInicio && horaFin <= horario.horaFin;
    const contieneTodo = horaInicio <= horario.horaInicio && horaFin >= horario.horaFin;
    
    if (existeInicio || existeFin || contieneTodo) {
      const cursoInfo = horario.asignacion?.curso;
      throw new Error(
        `El profesor ya tiene clase ${cursoInfo ? `en ${cursoInfo.grado}°${cursoInfo.seccion}` : ''} ` +
        `el ${diaSemana} de ${horario.horaInicio} a ${horario.horaFin}. ` +
        `No se puede asignar desde ${horaInicio} a ${horaFin}.`
      );
    }
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
        idCiclo,
        estado: true  // Solo traer horarios de asignaciones activas
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
    orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }]
  });
}
export async function getHorarioConfig() {
  const [bloques, dias] = await Promise.all([
    db.bloqueHorario.findMany({ orderBy: { orden: 'asc' } }),
    db.diaHabil.findMany({ where: { habilitado: true }, orderBy: { orden: 'asc' } }),
  ]);
  return { bloques, dias };
}
