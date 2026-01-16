"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { EstadoAsistencia } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function guardarAsistenciaAction(formData: FormData) {
  const session = await auth();

  // 1. Verificación de seguridad
  if (!session?.user) throw new Error("No autorizado");

  // 2. Extraemos los datos del formulario
  const idMatricula = Number(formData.get("idMatricula"));
  const idHorario = Number(formData.get("idHorario"));
  const fechaStr = formData.get("fecha") as string;
  const estado = formData.get("estado") as EstadoAsistencia;

  if (!idMatricula || !idHorario || !fechaStr || !estado) {
    throw new Error("Faltan datos obligatorios para registrar la asistencia");
  }

  const fecha = new Date(fechaStr);

  // SOLUCIÓN AL ERROR: Usamos idUsuario que es lo que viene en la sesión
  const idUsuarioCarga = session.user.idUsuario;

  if (!idUsuarioCarga) {
    throw new Error("No se pudo identificar al usuario que realiza la carga");
  }

  // 3. Lógica de guardado (Upsert)
  const existente = await db.asistencia.findFirst({
    where: {
      idMatricula,
      idHorario,
      fecha
    }
  });

  const fechaRegistro = new Date();

  if (existente) {
    await db.asistencia.update({
      where: { idAsistencia: existente.idAsistencia },
      data: {
        estado,
        idUsuario: idUsuarioCarga, // Usamos el ID correcto
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
        idUsuario: idUsuarioCarga, // Usamos el ID correcto
        fechaRegistro
      }
    });
  }

  // 4. Actualizamos la interfaz
  revalidatePath("/dashboard/asistencias");
}