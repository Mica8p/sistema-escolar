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

    revalidatePath('/dashboard/cursos');
    return { success: true, data: nuevoCurso };
  } catch (error) {
    console.error("Error en createCurso:", error);
    return { success: false, message: 'Error al crear el curso. Verifique los datos.' };
  }
}


export async function updateCurso(id: number, data: Partial<Omit<Curso, 'idCurso'>>) {
  try {
    const cursoActualizado = await cursoService.update(id, data);

    revalidatePath('/dashboard/cursos');
    revalidatePath(`/dashboard/cursos/${id}`);
    return { success: true, data: cursoActualizado };
  } catch (error) {
    console.error("Error en updateCurso:", error);
    return { success: false, message: 'No se pudo actualizar el curso.' };
  }
}

export async function deleteCurso(id: number) {
  try {
    await cursoService.delete(id);
    revalidatePath('/dashboard/cursos');
    return { success: true };
  } catch {
    return { success: false, message: 'No se puede eliminar un curso con alumnos o materias asignadas.' };
  }
}
