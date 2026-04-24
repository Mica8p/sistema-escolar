'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import {
  createHorario as createHorarioService,
  deleteHorario as deleteHorarioService,
  getHorariosByAsignacionId,
} from '@/service/horario.service';
import { DiaSemana } from '@prisma/client';

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
    const errorMessage = error instanceof Error ? error.message : 'Error al crear el horario';
    return { success: false, message: errorMessage };
  }
}

import { 
  getHorariosPorCurso as getHorariosPorCursoService, 
  getHorariosPorDocente as getHorariosPorDocenteService 
} from '@/service/horario.service';

export async function getHorariosPorCurso(idCurso: number, idCiclo: number) {
  return await getHorariosPorCursoService(idCurso, idCiclo);
}

export async function getHorariosPorDocente(idProfesor: number, idCiclo: number) {
  return await getHorariosPorDocenteService(idProfesor, idCiclo);
}

export async function getHorariosPorPersona(idPersona: number, idCiclo: number) {
  // Busca primero si existe un Profesor con este idPersona
  const profesor = await db.profesor.findUnique({
    where: { idPersona }
  });

  if (!profesor) {
    // Si no existe profesor aún, retorna array vacío (se crearía en la asignación)
    return [];
  }

  return await getHorariosPorDocenteService(profesor.idProfesor, idCiclo);
}

export async function deleteHorario(idHorario: number) {
  try {
    await deleteHorarioService(idHorario);
    revalidatePath('/dashboard/profesores');
    revalidatePath('/dashboard/asistencias');
    return { success: true };
  } catch (error) {
    console.error("❌ ERROR AL ELIMINAR:", error);
    const message = error instanceof Error ? error.message : 'Error al eliminar el horario';
    return { success: false, message };
  }
}