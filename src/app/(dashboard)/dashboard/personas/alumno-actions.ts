'use server'

import db from "@/lib/db";
import { getCicloActual } from "@/lib/ciclo-session";
import { revalidatePath } from "next/cache";

export async function darDeBajaAlumno(idAlumno: number) {
  try {
    const idCiclo = await getCicloActual();
    if (!idCiclo) {
      return { success: false, error: "No se encontró el ciclo lectivo actual." };
    }

    const matricula = await db.matricula.findFirst({
      where: {
        idAlumno: idAlumno,
        idCiclo: idCiclo,
      },
    });

    if (!matricula) {
      return { success: false, error: "El alumno no está inscripto en este ciclo lectivo." };
    }

    await db.matricula.update({
      where: { idMatricula: matricula.idMatricula },
      data: { estadoAcademico: "Retirado" },
    });

    const alumno = await db.alumno.findUnique({
      where: { idAlumno },
      select: { idPersona: true }
    });

    if (alumno) {
      try {
        await db.usuario.update({
          where: { idPersona: alumno.idPersona },
          data: { estado: false },
        });
      } catch (e) {
        console.log("El alumno no tenía usuario asociado o ya estaba inactivo.");
      }
    }

    revalidatePath("/dashboard/alumnos");
    revalidatePath(`/dashboard/alumnos/${idAlumno}`);
    revalidatePath("/dashboard/personas");

    return { success: true, message: "Alumno dado de baja correctamente." };
  } catch (error) {
    console.error("Error al dar de baja:", error);
    return { success: false, error: "Ocurrió un error al procesar la baja." };
  }
}