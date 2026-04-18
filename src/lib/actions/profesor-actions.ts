"use server";

import { ProfesorService } from "@/service/profesor.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  } catch (error: unknown) {
    type PrismaErrorWithCode = Error & { code?: string };
    const prismaError = error as PrismaErrorWithCode;
    if (error instanceof Error && prismaError.code === 'P2002') {
      return { error: "Error: Ya hay un profesor asignado a esta materia en este curso." };
    }
    return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado al guardar." };
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

  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    return { error: "Error al actualizar la asignación." };
  }
}



export async function desactivarAsignacionAction(idAsignacion: number) {
  try {
    await ProfesorService.eliminarAsignacion(idAsignacion);
    revalidatePath('/dashboard/profesores');
    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    type PrismaErrorWithCode = Error & { code?: string };
    const prismaError = error as PrismaErrorWithCode;
    if (error instanceof Error && prismaError.code === 'P2003') {
      return { success: false, message: 'No se puede eliminar: Esta materia ya tiene asistencias registradas.' };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al eliminar la asignación.'
    };
  }
}

export async function borrarErrorAsignacionAction(idAsignacion: number) {
  try {
    await ProfesorService.borrarAsignacionDefinitivamente(idAsignacion);
    revalidatePath("/dashboard/profesores");
    return { success: true };
  } catch {
    return { success: false, message: "No se puede borrar: Probablemente ya tiene notas cargadas." };
  }
}

export async function darDeBajaAction(idAsignacion: number, motivo: string, idSuplente?: number) {
  try {
    if (idSuplente) {
      await ProfesorService.reemplazarProfesor(idAsignacion, motivo, idSuplente);
    } else {
      await ProfesorService.darDeBaja(idAsignacion, motivo);
    }
    revalidatePath("/dashboard/profesores");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error en darDeBajaAction:", error);
    return { success: false, message: error instanceof Error ? error.message : "Error al procesar la baja." };
  }
}

export async function reincorporarDocenteAction(idAsignacion: number) {
  try {
    await ProfesorService.reincorporarDocente(idAsignacion);
    revalidatePath("/dashboard/profesores");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Error inesperado." };
  }
}

export async function getHistorialAsignacionesByCicloAction(idCiclo: number) {
  try {
    return await ProfesorService.getHistorialAsignaciones(idCiclo);
  } catch (error: unknown) {
    console.error("Error al obtener historial:", error);
    throw error;
  }
}