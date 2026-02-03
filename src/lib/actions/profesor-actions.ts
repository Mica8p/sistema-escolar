"use server";

import { ProfesorService } from "@/service/profesor.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Definimos el tipo de estado para el formulario
export type FormState = {
  error?: string;
  success?: boolean;
};

export async function asignarDocenteAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const idCiclo = Number(formData.get("idCiclo"));
  const idPersona = Number(formData.get("idPersona"));
  const idMateria = Number(formData.get("idMateria"));
  const idCurso = Number(formData.get("idCurso"));

  const slots: { dia: string, hora: string }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = key.match(/slots\[(\d+)]/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (!slots[index]) {
        slots[index] = { dia: '', hora: '' };
      }
      if (key.endsWith('dia')) {
        slots[index].dia = value as string;
      } else if (key.endsWith('hora')) {
        slots[index].hora = value as string;
      }
    }
  }

  if (!idPersona || !idMateria || !idCurso || !idCiclo || slots.length === 0) {
    return { error: "Todos los campos son obligatorios." };
  }

  try {
    await ProfesorService.asignarProfesor(idPersona, idMateria, idCurso, idCiclo, slots);

    revalidatePath("/dashboard/profesores");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Error: Ya hay un profesor asignado a esta materia en este curso." };
    }
    return { error: error.message || "Ocurrió un error inesperado al guardar." };
  }
}

export async function editarDocenteAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const idAsignacion = Number(formData.get("idAsignacion"));
  const idMateria = Number(formData.get("idMateria"));
  const idCurso = Number(formData.get("idCurso"));

  const slots: { dia: string, hora: string }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = key.match(/slots\[(\d+)]/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (!slots[index]) {
        slots[index] = { dia: '', hora: '' };
      }
      if (key.endsWith('dia')) {
        slots[index].dia = value as string;
      } else if (key.endsWith('hora')) {
        slots[index].hora = value as string;
      }
    }
  }

  if (!idAsignacion || !idMateria || !idCurso || slots.length === 0) {
    return { error: "Todos los campos son obligatorios." };
  }

  try {
    await ProfesorService.updateAsignacion(idAsignacion, {
      idMateria,
      idCurso,
    }, slots);

    revalidatePath("/dashboard/profesores");
    redirect("/dashboard/profesores");

  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    return { error: "Error al actualizar la asignación." };
  }
}

    

    export async function desactivarAsignacionAction(idAsignacion: number) {

      try {

        await ProfesorService.desactivarAsignacion(idAsignacion);

        revalidatePath('/dashboard/profesores');

        return { success: true };

      } catch (error) {

        console.error(error);

        return { success: false, message: 'Error al desactivar la asignación' };

      }

    }

    