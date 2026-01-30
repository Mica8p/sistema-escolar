"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AlumnoService } from "@/service/alumno.service";
import { z } from "zod";
import { EstadoAcademico } from "@prisma/client";

export async function vincularPadre(idAlumno: number, idPersona: number, relacion: string) {
  try {
    await db.$transaction(async (tx) => {
      // 1. Verificar si la Persona ya tiene un registro en la tabla Padre
      let padre = await tx.padre.findUnique({
        where: { idPersona }
      });

      // 2. Si no existe, lo creamos automáticamente
      if (!padre) {
        padre = await tx.padre.create({
          data: { idPersona }
        });
      }

      // 3. Crear la vinculación en AlumnoPadre usando el ID del padre (existente o nuevo)
      await tx.alumnoPadre.create({
        data: {
          idAlumno,
          idPadre: padre.idPadre,
          relacion,
        },
      });
    });

    revalidatePath(`/dashboard/alumnos/${idAlumno}`);
    return { success: true, message: "Tutor vinculado correctamente." };
  } catch (error) {
    console.error("Error al vincular tutor:", error);
    return { success: false, message: "Error al vincular el tutor." };
  }
}

export async function desvincularPadre(idAlumno: number, idPadre: number) {
  try {
    await db.alumnoPadre.delete({
      where: {
        idAlumno_idPadre: {
          idAlumno,
          idPadre,
        },
      },
    });
    revalidatePath(`/dashboard/alumnos/${idAlumno}`);
    return { success: true, message: "Vínculo eliminado correctamente." };
  } catch (error) {
    console.error("Error al desvincular tutor:", error);
    return { success: false, message: "Error al eliminar el vínculo." };
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

export async function cambiarEstadoMatriculaAction(idMatricula: number, nuevoEstado: EstadoAcademico, path: string) {
  try {
    await AlumnoService.updateEstadoMatricula(idMatricula, nuevoEstado);
    revalidatePath(path);
    return {
      success: true,
      message: "Estado académico actualizado correctamente."
    };
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return {
      success: false,
      message: "Error al actualizar el estado académico."
    };
  }
}

export async function updateMatriculaCursoAction(idMatricula: number, idCurso: number, path: string) {
  try {
    await AlumnoService.updateMatriculaCurso(idMatricula, idCurso);
    revalidatePath(path);
    return {
      success: true,
      message: "Curso actualizado correctamente."
    };
  } catch (error) {
    console.error("Error al actualizar curso:", error);
    return {
      success: false,
      message: "Error al actualizar el curso."
    };
  }
}

export async function deleteMatriculaAction(idMatricula: number) {
  try {
    await AlumnoService.deleteMatricula(idMatricula);
    revalidatePath("/dashboard/alumnos");
    return { success: true, message: "Inscripción eliminada correctamente." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
