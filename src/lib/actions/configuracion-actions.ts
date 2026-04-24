"use server";

import db from "@/lib/db";
import { DiaSemana, Turno } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type DiaHabilState = {
    nombre: DiaSemana;
    habilitado: boolean;
}[];

export type BloqueHorarioState = {
    horaInicio: string;
    horaFin: string;
}[];

export async function guardarConfiguracionDias(dias: DiaHabilState) {
    try {
        await db.$transaction(async (tx) => {
            await tx.diaHabil.deleteMany({});

            for (let i = 0; i < dias.length; i++) {
                await tx.diaHabil.create({
                    data: {
                        nombre: dias[i].nombre,
                        habilitado: dias[i].habilitado,
                        orden: i,
                    }
                });
            }
        });
        revalidatePath('/dashboard/configuraciones/horarios');
        revalidatePath('/dashboard/profesores');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error al guardar la configuración de días." };
    }
}

export async function guardarConfiguracionBloques(turno: Turno, bloques: BloqueHorarioState) {
  try {
    // Obtener los bloques actuales
    const bloquesActuales = await db.bloqueHorario.findMany({ where: { turno } });
    
    // Identificar bloques que serán eliminados
    const bloquesEliminados = bloquesActuales.filter(actual => 
      !bloques.some(nuevo => 
        nuevo.horaInicio === actual.horaInicio && nuevo.horaFin === actual.horaFin
      )
    );

    // Verificar si hay horarios asignados a los bloques que se van a eliminar
    for (const bloqueEliminado of bloquesEliminados) {
      const horariosAsignados = await db.horario.findMany({
        where: {
          horaInicio: bloqueEliminado.horaInicio,
          horaFin: bloqueEliminado.horaFin,
        },
        include: {
          asignacion: {
            include: {
              materia: true,
              curso: true,
            },
          },
        },
      });

      if (horariosAsignados.length > 0) {
        const detalles = horariosAsignados
          .map(h => `${h.asignacion.materia.nombre} - ${h.asignacion.curso.grado}°${h.asignacion.curso.seccion}`)
          .join(', ');
        throw new Error(
          `No se puede eliminar el bloque ${bloqueEliminado.horaInicio}-${bloqueEliminado.horaFin} ` +
          `porque tiene clases asignadas: ${detalles}`
        );
      }
    }

    // Si no hay conflictos, proceder con la actualización
    await db.$transaction(async (tx) => {
      await tx.bloqueHorario.deleteMany({ where: { turno } });

      for (let i = 0; i < bloques.length; i++) {
        if (!bloques[i].horaInicio || !bloques[i].horaFin) continue;

        await tx.bloqueHorario.create({
          data: {
            turno: turno,
            horaInicio: bloques[i].horaInicio,
            horaFin: bloques[i].horaFin,
            orden: i,
          }
        });
      }
    });
    revalidatePath('/dashboard/configuraciones/horarios');
    revalidatePath('/dashboard/profesores');
    return { success: true };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al guardar los bloques horarios.";
    return { success: false, message };
  }
}
