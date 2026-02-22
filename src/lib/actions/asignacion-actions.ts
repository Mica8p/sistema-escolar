"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// src/lib/actions/asignacion-actions.ts

export async function clonarAsignacionesYHorarios(cicloOrigenId: number, cicloDestinoId: number) {
  try {
    return await db.$transaction(async (tx) => {
      // 🚩 PASO 1: "Hoja en blanco" para el ciclo nuevo
      // Buscamos lo que ya existe en el 2027 para borrarlo antes de clonar
      const asignacionesDestino = await tx.asignacionAcademica.findMany({
        where: { idCiclo: cicloDestinoId },
        select: { idAsignacion: true }
      });
      const idsBorrar = asignacionesDestino.map(a => a.idAsignacion);

      // Limpiamos horarios y asignaciones viejas del ciclo destino
      await tx.horario.deleteMany({ where: { idAsignacion: { in: idsBorrar } } });
      await tx.asignacionAcademica.deleteMany({ where: { idCiclo: cicloDestinoId } });

      // 🚩 PASO 2: Traer solo lo que terminó ACTIVO el año pasado
      const asignacionesAnteriores = await tx.asignacionAcademica.findMany({
        where: { idCiclo: cicloOrigenId, estado: true },
        include: { horarios: true }
      });

      if (asignacionesAnteriores.length === 0) {
        throw new Error("No hay asignaciones activas en el ciclo anterior para migrar.");
      }

      let asignacionesCreadas = 0;
      let horariosCreados = 0;

      for (const asig of asignacionesAnteriores) {
        const nuevaAsig = await tx.asignacionAcademica.create({
          data: {
            idProfesor: asig.idProfesor,
            idMateria: asig.idMateria,
            idCurso: asig.idCurso,
            idCiclo: cicloDestinoId,
            cargaHoraria: asig.cargaHoraria,
            estado: true,
          }
        });
        asignacionesCreadas++;

        if (asig.horarios.length > 0) {
          const nuevosHorarios = asig.horarios.map(h => ({
            idAsignacion: nuevaAsig.idAsignacion,
            diaSemana: h.diaSemana,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            aula: h.aula
          }));
          await tx.horario.createMany({ data: nuevosHorarios });
          horariosCreados += nuevosHorarios.length;
        }
      }

      revalidatePath("/dashboard/profesores");
      revalidatePath("/dashboard/horarios");

      return { success: true, count: asignacionesCreadas, horariosCount: horariosCreados };
    });
  } catch (error: any) {
    return { error: error.message || "Error en la migración." };
  }
}