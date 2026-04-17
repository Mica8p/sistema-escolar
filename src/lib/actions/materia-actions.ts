'use server';

import { materiaService } from '@/service/materia.service';
import { Materia } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getAllMaterias() {
  return await materiaService.getAll();
}

export async function getMateriaById(id: number) {
  return await materiaService.getById(id);
}

export async function createMateria(data: Omit<Materia, 'idMateria'>) {
  try {
    const nuevaMateria = await materiaService.create(data);
    revalidatePath('/dashboard/materias');
    return { success: true, data: nuevaMateria };
  } catch {
    return { success: false, message: 'Error al crear la materia.' };
  }
}

export async function updateMateria(id: number, data: Omit<Materia, 'idMateria'>) {
  try {
    const materiaActualizada = await materiaService.update(id, data);
    revalidatePath('/dashboard/materias');
    revalidatePath(`/dashboard/materias/${id}`);
    return { success: true, data: materiaActualizada };
  } catch {
    return { success: false, message: 'Error al actualizar la materia.' };
  }
}

export async function deleteMateria(id: number) {
  try {
    await materiaService.delete(id);
    revalidatePath('/dashboard/materias');
    return { success: true };
  } catch {
    return { success: false, message: 'Error al eliminar la materia.' };
  }
}
