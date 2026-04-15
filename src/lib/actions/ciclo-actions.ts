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
    // Verificar si ya existe un ciclo para este año
    const cicloExistente = await db.cicloLectivo.findFirst({
      where: { anio }
    });

    if (cicloExistente) {
      return { success: false, message: "Ya existe un ciclo lectivo para el año " + anio + ". No se pueden crear ciclos duplicados." };
    }

    if (estado) {
      await db.cicloLectivo.updateMany({
        where: { estado: true },
        data: { estado: false },
      });
    }

    const newCiclo = await db.cicloLectivo.create({
      data: { anio, estado },
    });

    // Sincronizar la cookie con el ciclo activo del sistema
    if (estado) {
      const cookieStore = await cookies();
      cookieStore.set("cicloSeleccionado", String(newCiclo.idCiclo), {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        path: "/",
      });
    }

    revalidatePath("/dashboard/ciclos");
    return { success: true, idCiclo: newCiclo.idCiclo };
  } catch (error) {
    console.error("Error inesperado al crear ciclo:", error);
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
        // Verificar si ya existe otro ciclo con este año
        const cicloExistente = await db.cicloLectivo.findFirst({
            where: { 
                anio,
                NOT: { idCiclo: id }
            }
        });

        if (cicloExistente) {
            return { success: false, message: "Ya existe otro ciclo lectivo para el año " + anio + ". No se pueden tener ciclos duplicados." };
        }

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

        // Sincronizar la cookie con el ciclo activo del sistema
        if (estado) {
            const cookieStore = await cookies();
            cookieStore.set("cicloSeleccionado", String(id), {
                expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                path: "/",
            });
        }

        revalidatePath("/dashboard/ciclos");
        return { success: true };
    } catch (error) {
        console.error("Error inesperado al actualizar ciclo:", error);
        return { success: false, message: "Error al actualizar el ciclo lectivo." };
    }
}

export async function toggleCicloEstado(id: number, currentState: boolean) {
  try {
    const newState = !currentState;
    if (newState) {
      await db.cicloLectivo.updateMany({
        where: { estado: true },
        data: { estado: false },
      });
    }

    await db.cicloLectivo.update({
      where: { idCiclo: id },
      data: { estado: newState },
    });

    revalidatePath("/dashboard/ciclos");
    return { success: true };
  } catch {
    return { success: false, message: "Error al cambiar el estado del ciclo lectivo." };
  }
}

export async function deleteCiclo(id: number) {
  try {
    await db.cicloLectivo.delete({ where: { idCiclo: id } });
    revalidatePath("/dashboard/ciclos");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el ciclo lectivo:", error);
    return { success: false, message: "Error al eliminar el ciclo lectivo." };
  }
}

export async function getAllCiclos() {
  try {
    const ciclos = await db.cicloLectivo.findMany({
      orderBy: {
        anio: "desc",
      },
    });
    return ciclos;
  } catch (error) {
    console.error("Error al obtener todos los ciclos lectivos:", error);
    return [];
  }
}