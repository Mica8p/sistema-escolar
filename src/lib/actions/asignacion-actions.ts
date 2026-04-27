"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";


export async function clonarAsignacionesYHorarios(cicloOrigenId: number, cicloDestinoId: number) {
  try {
    return await db.$transaction(
      async (tx) => {
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
        const todosLosHorarios: Array<any> = [];

        // Primero crear todas las asignaciones y recolectar horarios
        const asignacionesNuevas = await Promise.all(
          asignacionesAnteriores.map(asig =>
            tx.asignacionAcademica.create({
              data: {
                idProfesor: asig.idProfesor,
                idMateria: asig.idMateria,
                idCurso: asig.idCurso,
                idCiclo: cicloDestinoId,
                cargaHoraria: asig.cargaHoraria,
                estado: true,
              }
            })
          )
        );

        asignacionesCreadas = asignacionesNuevas.length;

        // Mapear horarios con las nuevas asignaciones
        for (let i = 0; i < asignacionesAnteriores.length; i++) {
          const asigAnt = asignacionesAnteriores[i];
          const asigNueva = asignacionesNuevas[i];

          if (asigAnt.horarios.length > 0) {
            const nuevosHorarios = asigAnt.horarios.map(h => ({
              idAsignacion: asigNueva.idAsignacion,
              diaSemana: h.diaSemana,
              horaInicio: h.horaInicio,
              horaFin: h.horaFin,
              aula: h.aula
            }));
            todosLosHorarios.push(...nuevosHorarios);
          }
        }

        // Crear todos los horarios de una sola vez
        if (todosLosHorarios.length > 0) {
          await tx.horario.createMany({ data: todosLosHorarios });
          horariosCreados = todosLosHorarios.length;
        }

        revalidatePath("/dashboard/profesores");
        revalidatePath("/dashboard/horarios");

        return { success: true, count: asignacionesCreadas, horariosCount: horariosCreados };
      },
      { maxWait: 30000, timeout: 30000 }
    );
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Error en la copia de asignaciones." };
  }
}