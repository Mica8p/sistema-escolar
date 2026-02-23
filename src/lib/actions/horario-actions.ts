'use server';

import { revalidatePath } from 'next/cache';
import {
  createHorario as createHorarioService,
  deleteHorario as deleteHorarioService,
  getHorariosByAsignacionId,
} from '@/service/horario.service';
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
    const diaEnum = diaSemana.toUpperCase() as DiaSemana;

    await createHorarioService({
      idAsignacion: Number(idAsignacion),
      diaSemana: diaEnum,
      horaInicio,
      horaFin,
    });

    revalidatePath('/dashboard/profesores');
    revalidatePath('/dashboard/asistencias');

    return { success: true };
  } catch (error) {
    console.error("❌ ERROR AL CREAR HORARIO:", error);
    return { success: false, message: 'Error al crear el horario' };
  }
}

import { getHorariosPorCurso as getHorariosPorCursoService } from '@/service/horario.service';

export async function getHorariosPorCurso(idCurso: number, idCiclo: number) {
  return await getHorariosPorCursoService(idCurso, idCiclo);
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