import { Horario, Turno, DiaSemana } from '@prisma/client';
import db from '@/lib/db';

export const getHorariosByAsignacionId = async (asignacionId: number): Promise<Horario[]> => {
  return db.horario.findMany({
    where: { idAsignacion: asignacionId },
    // Ordenamos para que aparezcan prolijos en la lista
    orderBy: { horaInicio: 'asc' }
  });
};

export const createHorario = async (data: {
  idAsignacion: number;
  diaSemana: string; // Recibimos el string (ej: "LUNES")
  horaInicio: string;
  horaFin: string;
}): Promise<Horario> => {
  const { idAsignacion, diaSemana, horaInicio, horaFin } = data;

  // ELIMINAMOS toda la lógica de "new Date()"
  // Guardamos los strings directamente como vienen del formulario

  return db.horario.create({
    data: {
      idAsignacion,
      // Forzamos el tipo DiaSemana para que Prisma no se queje
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