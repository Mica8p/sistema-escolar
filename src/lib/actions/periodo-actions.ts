"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { z } from "zod";
import { PeriodoNombre } from "@prisma/client";

const periodoSchema = z.object({
  nombre: z.nativeEnum(PeriodoNombre),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  idCiclo: z.coerce.number(),
});

export async function createPeriodoAction(prevState: unknown, formData: FormData) {
  const data = {
    nombre: formData.get("nombre"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
    idCiclo: formData.get("idCiclo"),
  };

  const validation = periodoSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }

  const { nombre, fechaInicio, fechaFin, idCiclo } = validation.data;

  if (fechaInicio >= fechaFin) {
    return { success: false, message: "La fecha de inicio debe ser anterior a la fecha de fin." };
  }

  try {
    const existente = await db.periodoAcademico.findFirst({
      where: { idCiclo, nombre },
    });

    if (existente) {
      return { success: false, message: `El periodo ${nombre} ya existe en este ciclo.` };
    }

    await db.periodoAcademico.create({
      data: { nombre, fechaInicio, fechaFin, idCiclo },
    });

    revalidatePath("/dashboard/ciclos");
    return { success: true, message: "Periodo creado correctamente." };
  } catch {
    return { success: false, message: "Error al crear el periodo." };
  }
}

export async function deletePeriodoAction(idPeriodo: number) {
  try {
    await db.periodoAcademico.delete({ where: { idPeriodo } });
    revalidatePath("/dashboard/ciclos");
    return { success: true };
  } catch {
    return { success: false, message: "Error al eliminar." };
  }
}

export async function getPeriodosByCiclo(idCiclo: number) {
  try {
    const periodos = await db.periodoAcademico.findMany({
      where: { idCiclo },
      orderBy: { fechaInicio: "asc" },
    });
    return periodos;
  } catch {
    console.error("Error al obtener periodos por ciclo:");
    return [];
  }
}

export async function togglePeriodoCerradoAction(idPeriodo: number, cerrado: boolean) {
    try {
        // Si está intentando CERRAR el período, validar notas
        if (cerrado) {
            const { validarNotasFaltantesPeriodo } = await import("@/service/calificaciones.service");
            const validacion = await validarNotasFaltantesPeriodo(idPeriodo);
            
            if (!validacion.ok) {
                return { 
                    success: false, 
                    message: validacion.mensaje || 'No se puede cerrar el período'
                };
            }
        }

        await db.periodoAcademico.update({
            where: { idPeriodo },
            data: { cerrado }
        });
        return { success: true };
    } catch {
        return { success: false, message: 'No se pudo cambiar el estado' };
    }
}

export async function updatePeriodoAction(idPeriodo: number, nombre: string, fechaInicio: string, fechaFin: string) {
    try {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        if (inicio >= fin) {
            return { success: false, message: 'La fecha de inicio debe ser anterior a la fecha de fin' };
        }

        // Obtener el período actual para verificar el ciclo
        const periodoActual = await db.periodoAcademico.findUnique({
            where: { idPeriodo },
            select: { idCiclo: true, nombre: true }
        });

        if (!periodoActual) {
            return { success: false, message: 'Período no encontrado' };
        }

        // Si el nombre cambió, validar que no exista otro período con ese nombre en el mismo ciclo
        if (nombre !== periodoActual.nombre) {
            const existente = await db.periodoAcademico.findFirst({
                where: {
                    idCiclo: periodoActual.idCiclo,
                    nombre: nombre as PeriodoNombre,
                    idPeriodo: { not: idPeriodo }
                }
            });

            if (existente) {
                return { success: false, message: 'Ya existe un período con ese nombre en este ciclo' };
            }
        }

        await db.periodoAcademico.update({
            where: { idPeriodo },
            data: {
                nombre: nombre as PeriodoNombre,
                fechaInicio: inicio,
                fechaFin: fin
            }
        });

        revalidatePath("/dashboard/ciclos");
        return { success: true };
    } catch {
        return { success: false, message: 'No se pudo actualizar el período' };
    }
}