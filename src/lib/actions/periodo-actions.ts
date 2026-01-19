"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { z } from "zod";
import { PeriodoNombre } from "@prisma/client";

const periodoSchema = z.object({
  nombre: z.nativeEnum(PeriodoNombre, {
    errorMap: () => ({ message: "El tipo de periodo no es válido." }),
  }),
  fechaInicio: z.coerce.date({
    errorMap: () => ({ message: "Fecha de inicio inválida." }),
  }),
  fechaFin: z.coerce.date({
    errorMap: () => ({ message: "Fecha de fin inválida." }),
  }),
  idCiclo: z.coerce.number(),
});

export async function createPeriodoAction(prevState: any, formData: FormData) {
  const data = {
    nombre: formData.get("nombre"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
    idCiclo: formData.get("idCiclo"),
  };

  const validation = periodoSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
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
  } catch (error) {
    return { success: false, message: "Error al crear el periodo." };
  }
}

export async function deletePeriodoAction(idPeriodo: number) {
  try {
    await db.periodoAcademico.delete({ where: { idPeriodo } });
    revalidatePath("/dashboard/ciclos");
    return { success: true };
  } catch (error) {
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
  } catch (error) {
    console.error("Error al obtener periodos por ciclo:", error);
    return [];
  }
}