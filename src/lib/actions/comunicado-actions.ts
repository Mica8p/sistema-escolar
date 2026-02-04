"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function enviarComunicado(formData: FormData) {
  const session = await auth();

  if (!session?.user || !["ADMIN", "DOCENTE"].some(rol => session.user.roles?.includes(rol))) {
    return { error: "No tienes permisos para enviar comunicados." };
  }

  const titulo = formData.get("titulo") as string;
  const contenido = formData.get("contenido") as string;
  const target = formData.get("target") as string;
  const idTargetRaw = formData.get("idTarget") as string;

  const idUsuario = (session?.user as any)?.idUsuario;
  const idTarget = idTargetRaw ? parseInt(idTargetRaw) : null;

  try {
    await db.comunicado.create({
      data: {
        titulo,
        contenido,
        target,
        idTarget,
        idUsuario,
        fecha: new Date(),
      },
    });

    revalidatePath("/dashboard/comunicados");
    return { success: true };
  } catch (error) {
    console.error("Error al enviar comunicado:", error);
    return { error: "Error interno al guardar el comunicado." };
  }
}

export async function marcarComoLeido(idComunicado: number) {
  const session = await auth();
  const idUsuario = session?.user?.idUsuario;

  if (!idUsuario) return { error: "Usuario no identificado" };

  try {
    await db.comunicadoVisto.upsert({
      where: {
        idComunicado_idUsuario: {
          idComunicado,
          idUsuario,
        },
      },
      update: {},
      create: {
        idComunicado,
        idUsuario,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/comunicados");
    return { success: true };
  } catch (error) {
    console.error("Error al marcar como leído:", error);
    return { error: "No se pudo actualizar el estado de lectura" };
  }
}

export async function eliminarComunicado(idComunicado: number) {
  const session = await auth();
  const idUsuario = (session?.user as any)?.idUsuario;

  if (!idUsuario) return { error: "No autorizado" };

  try {
    const comunicado = await db.comunicado.findUnique({
      where: { idComunicado },
      select: { idUsuario: true }
    });

    const roles = (session?.user as any)?.roles || [];
    const esAdmin = roles.includes("ADMIN");

    if (comunicado?.idUsuario !== idUsuario && !esAdmin) {
      return { error: "No tienes permiso para eliminar este mensaje" };
    }

    await db.comunicadoVisto.deleteMany({
      where: { idComunicado }
    });

    await db.comunicado.delete({
      where: { idComunicado }
    });

    revalidatePath("/dashboard/comunicados");
    revalidatePath("/dashboard/comunicados/enviados");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar:", error);
    return { error: "No se pudo eliminar el comunicado" };
  }
}