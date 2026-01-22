"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AlumnoService } from "@/service/alumno.service";
import { z } from "zod";

export async function vincularPadre(idAlumno: number, idPadre: number, relacion: string) {
  try {
    await db.alumnoPadre.create({
      data: {
        idAlumno,
        idPadre,
        relacion,
      },
    });

    revalidatePath(`/dashboard/alumnos/${idAlumno}`);
    return { success: true, message: "Tutor vinculado correctamente." };
  } catch (error) {
    return { success: false, message: "Error al vincular el tutor." };
  }
}

const InscripcionSchema = z.object({
  idPersona: z.coerce.number().min(1, "Debe seleccionar una persona."),
  idCurso: z.coerce.number().min(1, "Debe seleccionar un curso."),
});

export async function inscribirAlumnoAction(prevState: any, formData: FormData) {
  const validatedFields = InscripcionSchema.safeParse({
    idPersona: formData.get("idPersona"),
    idCurso: formData.get("idCurso"),
  });

  if (!validatedFields.success) {
    return {
      error: "Campos inválidos. Por favor, verifique la información.",
    };
  }

  try {
    await AlumnoService.enroll(validatedFields.data.idPersona, validatedFields.data.idCurso);
    revalidatePath("/dashboard/alumnos");
    return { success: true };
  } catch (error) {
    console.error("Error en la inscripción:", error);
    return {
      error: "Hubo un error al procesar la inscripción. Inténtelo de nuevo.",
    };
  }
}
