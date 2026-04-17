"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";


export async function clonarAsignacionesYHorarios(cicloOrigenId: number, cicloDestinoId: number) {
  try {
    return await db.$transaction(async (tx) => {
      // Verificar si ya existen asignaciones en el ciclo destino
      const asignacionesExistentes = await tx.asignacionAcademica.findMany({
        where: { idCiclo: cicloDestinoId }
      });

      if (asignacionesExistentes.length > 0) {
        throw new Error("Este ciclo ya tiene asignaciones. No se pueden duplicar.");
      }

      const asignacionesAnteriores = await tx.asignacionAcademica.findMany({
        where: { idCiclo: cicloOrigenId, estado: true },
        include: { horarios: true }
      });

      if (asignacionesAnteriores.length === 0) {
        throw new Error("No hay asignaciones activas en el ciclo anterior para copiar.");
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
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Error en la copia de asignaciones." };
  }
}