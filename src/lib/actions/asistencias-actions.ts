"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { EstadoAsistencia } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function guardarAsistenciaAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) throw new Error("No autorizado");

  const idMatricula = Number(formData.get("idMatricula"));
  const idHorario = Number(formData.get("idHorario"));
  const fechaStr = formData.get("fecha") as string;
  const estado = formData.get("estado") as EstadoAsistencia;

  if (!idMatricula || !idHorario || !fechaStr || !estado) {
    throw new Error("Faltan datos para registrar la asistencia");
  }

  // CRÍTICO: Normalizamos la fecha a 00:00:00 igual que en el service
  const fecha = new Date(fechaStr + 'T12:00:00');
  fecha.setHours(0, 0, 0, 0);

  const idUsuarioCarga = session.user.idUsuario;
  if (!idUsuarioCarga) throw new Error("Usuario de carga no identificado");

  const fechaRegistro = new Date();

  // LÓGICA UPSERT PROFESIONAL
  // Buscamos si ya existe para este alumno, este horario y este día
  const existente = await db.asistencia.findFirst({
    where: {
      idMatricula,
      idHorario,
      fecha
    }
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

  // Refrescamos la página de asistencias para ver el cambio
  revalidatePath("/dashboard/asistencias");
}