'use server';

import { revalidatePath } from 'next/cache';
import {
  createHorario as createHorarioService,
  deleteHorario as deleteHorarioService,
  getHorariosByAsignacionId,
} from '@/service/horario.service';
// Importamos los Enums oficiales para evitar errores de escritura
import { Turno, DiaSemana } from '@prisma/client';

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
    // 1. Aseguramos que el día llegue en MAYÚSCULAS para el Enum (LUNES, MARTES...)
    const diaEnum = diaSemana.toUpperCase() as DiaSemana;

    await createHorarioService({
      idAsignacion: Number(idAsignacion),
      diaSemana: diaEnum,
      horaInicio,
      horaFin,
    });

    revalidatePath('/dashboard/profesores');
    revalidatePath('/dashboard/asistencias'); // Refrescamos también asistencias

    return { success: true };
  } catch (error) {
    // 3. Logeamos el error real en la terminal para que lo veas
    console.error("❌ ERROR AL CREAR HORARIO:", error);
    return { success: false, message: 'Error al crear el horario' };
  }
}

export async function deleteHorario(idHorario: number) {
  try {
    await deleteHorarioService(idHorario);
    revalidatePath('/dashboard/profesores');
    revalidatePath('/dashboard/asistencias');
    return { success: true };
  } catch (error) {
    console.error("❌ ERROR AL ELIMINAR:", error);
    return { success: false, message: 'Error al eliminar el horario' };
  }
}