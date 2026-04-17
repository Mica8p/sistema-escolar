"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { z } from "zod";

const cicloSchema = z.object({
  anio: z.coerce.number().int().min(2000, "El año debe ser mayor a 2000."),
  estado: z.boolean(),
});

export async function cambiarCiclo(idCiclo: number) {
  const cookieStore = await cookies();

  cookieStore.set("cicloSeleccionado", String(idCiclo), {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    path: "/",
  });

  revalidatePath("/");
}

export async function createCiclo(data: { anio: number, estado: boolean }) {
  const validation = cicloSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }

  const { anio, estado } = validation.data;

  try {
    if (estado) {
      await db.cicloLectivo.updateMany({
        where: { estado: true },
        data: { estado: false },
      });
    }

    await db.cicloLectivo.create({
      data: { anio, estado },
    });

    revalidatePath("/dashboard/ciclos");
    return { success: true };
  } catch {
    return { success: false, message: "Error al crear el ciclo lectivo." };
  }
}

export async function updateCiclo(id: number, data: { anio: number, estado: boolean }) {
    const validation = cicloSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, message: validation.error.issues[0].message };
    }

    const { anio, estado } = validation.data;

    try {
        if (estado) {
            await db.cicloLectivo.updateMany({
                where: { estado: true, NOT: { idCiclo: id } },
                data: { estado: false },
            });
        }

        await db.cicloLectivo.update({
            where: { idCiclo: id },
            data: { anio, estado },
        });

        revalidatePath("/dashboard/ciclos");
        return { success: true };
    } catch {
        return { success: false, message: "Error al actualizar el ciclo lectivo." };
    }
}

export async function deleteCiclo(id: number) {
  try {
    await db.cicloLectivo.delete({
      where: { idCiclo: id },
    });
    revalidatePath("/dashboard/ciclos");
    return { success: true };
  } catch {

    return { success: false, message: "Error al eliminar el ciclo lectivo." };
  }
}