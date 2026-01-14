"use server";

import { AlumnoService } from "@/service/alumno.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function inscribirAlumnoAction(formData: FormData): Promise<void> {
  const idPersona = Number(formData.get("idPersona"));
  const idCurso = Number(formData.get("idCurso"));

  if (!idPersona || !idCurso) {
    // En lugar de return { error }, simplemente salimos o podrías lanzar un error
    return;
  }

  try {
    await AlumnoService.enroll(idPersona, idCurso);
  } catch (error) {
    console.error("Error en la inscripción:", error);
    // Aquí podrías redirigir a una página de error o simplemente no hacer nada
    return;
  }

  // Esto es lo que hace que la tabla se actualice
  revalidatePath("/dashboard/alumnos");
  redirect("/dashboard/alumnos");
}