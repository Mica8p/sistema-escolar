'use server';

import { revalidatePath } from 'next/cache';
import {
  createHorario as createHorarioService,
  deleteHorario as deleteHorarioService,
  getHorariosByAsignacionId,
} from '@/service/horario.service';
import { Turno } from '@prisma/client';

export async function getHorarios(asignacionId: number) {
  return await getHorariosByAsignacionId(asignacionId);
}

export async function createHorario(
  idAsignacion: number,
  diaSemana: string,
  horaInicio: string,
  horaFin: string
) {
  try {
    await createHorarioService({
      idAsignacion,
      diaSemana,
      horaInicio,
      horaFin,
      turno: Turno.Mañana,
    });
    revalidatePath('/dashboard/profesores');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al crear el horario' };
  }
}

export async function deleteHorario(idHorario: number) {
  try {
    await deleteHorarioService(idHorario);
    revalidatePath('/dashboard/profesores');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al eliminar el horario' };
  }
}
