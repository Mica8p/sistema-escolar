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
  const idCiclo = Number(formData.get("idCiclo")); // <--- Viene del input hidden que pusimos
  const idPersona = Number(formData.get("idPersona"));
  const idMateria = Number(formData.get("idMateria"));
  const idCurso = Number(formData.get("idCurso"));

  // Verificamos que tengamos el ciclo también
  if (!idPersona || !idMateria || !idCurso || !idCiclo) {
    return { error: "Todos los campos son obligatorios." };
  }

  try {
    // LLAMADA CORREGIDA: Pasamos los 4 parámetros
    await ProfesorService.asignarProfesor(idPersona, idMateria, idCurso, idCiclo);

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
  const idPersona = Number(formData.get("idPersona"));
  const idMateria = Number(formData.get("idMateria"));
  const idCurso = Number(formData.get("idCurso"));

  try {
    // Usamos el servicio que ya preparaste con 'updateAsignacion'
    await ProfesorService.updateAsignacion(idAsignacion, {
      idMateria,
      idCurso,
      // Nota: No cambiamos el idProfesor aquí porque estamos editando
      // la asignación de ESTE profesor específico.
    });

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

    