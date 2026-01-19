"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { z } from "zod";

// Esquema de validación con Zod
const cicloSchema = z.object({
  anio: z.coerce.number().int().min(2000, "El año debe ser mayor a 2000."),
  estado: z.boolean(),
});

export async function cambiarCiclo(idCiclo: number) {
  const cookieStore = await cookies();
  
  // Guardamos la elección por 1 año
  cookieStore.set("cicloSeleccionado", String(idCiclo), {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    path: "/",
  });
  
  // Recargamos toda la aplicación para que los datos se actualicen al instante
  revalidatePath("/"); 
}

export async function createCiclo(data: { anio: number, estado: boolean }) {
  const validation = cicloSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }

  const { anio, estado } = validation.data;

  try {
    if (estado) {
      // Si este ciclo será el activo, desactivamos todos los demás
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
  } catch (error) {
    return { success: false, message: "Error al crear el ciclo lectivo." };
  }
}

export async function updateCiclo(id: number, data: { anio: number, estado: boolean }) {
    const validation = cicloSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, message: validation.error.errors[0].message };
    }

    const { anio, estado } = validation.data;

    try {
        if (estado) {
            // Si este ciclo será el activo, desactivamos todos los demás
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
    } catch (error) {
        return { success: false, message: "Error al actualizar el ciclo lectivo." };
    }
}

export async function toggleCicloEstado(id: number, currentState: boolean) {
  try {
    const newState = !currentState;
    if (newState) {
      // If we're activating this cycle, deactivate all others
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
  } catch (error) {
    return { success: false, message: "Error al cambiar el estado del ciclo lectivo." };
  }
}

export async function deleteCiclo(id: number) {
  try {
    /*
    await db.cicloLectivo.delete({
      where: { idCiclo: id },
    });
    */
    revalidatePath("/dashboard/ciclos");
    return { success: true };
  } catch (error) {
    // Prisma tira un error conocido (P2025) si no se encuentra el registro
    // Podríamos manejarlo específicamente si quisiéramos
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