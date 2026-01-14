'use server';

import { cursoService } from '@/service/curso.service';
import { Curso } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getAllCursos() {
  return await cursoService.getAll();
}

export async function getCursoById(id: number) {
  return await cursoService.getById(id);
}

export async function createCurso(data: Omit<Curso, 'idCurso'>) {
  try {
    const nuevoCurso = await cursoService.create(data);
    revalidatePath('/dashboard/cursos'); // Actualiza la lista de cursos en la UI
    return { success: true, data: nuevoCurso };
  } catch (error) {
    return { success: false, message: 'Error al crear el curso.' };
  }
}

export async function updateCurso(id: number, data: Omit<Curso, 'idCurso'>) {
  try {
    const cursoActualizado = await cursoService.update(id, data);
    revalidatePath('/dashboard/cursos');
    revalidatePath(`/dashboard/cursos/${id}`);
    return { success: true, data: cursoActualizado };
  } catch (error) {
    return { success: false, message: 'Error al actualizar el curso.' };
  }
}

export async function deleteCurso(id: number) {
  try {
    await cursoService.delete(id);
    revalidatePath('/dashboard/cursos');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Error al eliminar el curso.' };
  }
}
