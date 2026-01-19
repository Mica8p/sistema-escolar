
import { PrismaClient, Horario, Turno } from '@prisma/client';
import db from '@/lib/db';

export const getHorariosByAsignacionId = async (asignacionId: number): Promise<Horario[]> => {
  return db.horario.findMany({
    where: { idAsignacion: asignacionId },
  });
};

export const createHorario = async (data: {
  idAsignacion: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  turno: Turno;
}): Promise<Horario> => {
  const { idAsignacion, diaSemana, horaInicio, horaFin, turno } = data;

  const [startHour, startMinute] = horaInicio.split(':').map(Number);
  const [endHour, endMinute] = horaFin.split(':').map(Number);

  const startDate = new Date();
  startDate.setHours(startHour, startMinute, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHour, endMinute, 0, 0);

  return db.horario.create({
    data: {
      idAsignacion,
      diaSemana,
      horaInicio: startDate,
      horaFin: endDate,
      turno,
    },
  });
};

export const deleteHorario = async (horarioId: number): Promise<Horario> => {
  return db.horario.delete({
    where: { idHorario: horarioId },
  });
};
