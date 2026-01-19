"use server";

import { AlumnoService } from "@/service/alumno.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function inscribirAlumnoAction(fprevState: any, formData: FormData): Promise<{ success?: boolean; error?: string } | void> {
  const idPersona = Number(formData.get('idPersona'));
  const idCurso = Number(formData.get('idCurso'));

  if (!idPersona || !idCurso) {
    return { error: "Debe seleccionar una persona y un curso válidos." };
  }

  try {
    await AlumnoService.enroll(idPersona, idCurso);
  } catch (error: any) {
    console.error("Error en la inscripción:", error);
    // CAMBIO: Retornamos el error para que la UI lo maneje
    return { error: "Hubo un problema al procesar la inscripción. Verifique si el alumno ya está inscripto." };
  }

  revalidatePath("/dashboard/alumnos");
  redirect("/dashboard/alumnos");
}