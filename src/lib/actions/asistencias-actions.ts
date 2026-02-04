"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { EstadoAsistencia } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function guardarAsistenciaAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) throw new Error("No autorizado");

    const idMatricula = Number(formData.get("idMatricula"));
    const idHorario = Number(formData.get("idHorario"));
    const fechaStr = formData.get("fecha") as string;
    const estado = formData.get("estado") as EstadoAsistencia;

    if (!idMatricula || !idHorario || !fechaStr || !estado) {
      throw new Error("Faltan datos para registrar la asistencia");
    }

    const fecha = new Date(fechaStr + 'T12:00:00');
    fecha.setHours(0, 0, 0, 0);

    const idUsuarioCarga = session.user.idUsuario;
    if (!idUsuarioCarga) throw new Error("Usuario de carga no identificado");

    const fechaRegistro = new Date();

    const existente = await db.asistencia.findFirst({
      where: { idMatricula, idHorario, fecha }
    });

    if (existente) {
      await db.asistencia.update({
        where: { idAsistencia: existente.idAsistencia },
        data: {
          estado,
          idUsuario: idUsuarioCarga,
          fechaRegistro
        }
      });
    } else {
      await db.asistencia.create({
        data: {
          idMatricula,
          idHorario,
          fecha,
          estado,
          idUsuario: idUsuarioCarga,
          fechaRegistro
        }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/asistencias");

    return { success: true };
  } catch (error: any) {
    console.error("Error en guardarAsistenciaAction:", error);
    return { success: false, message: error.message };
  }
}