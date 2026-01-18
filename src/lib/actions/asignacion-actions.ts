"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function clonarAsignaciones(cicloOrigenId: number, cicloDestinoId: number) {
  try {
    return await db.$transaction(async (tx) => {
      // 1. Verificamos si ya hay asignaciones en el destino para evitar duplicados
      const conteoDestino = await tx.asignacionAcademica.count({
        where: { idCiclo: cicloDestinoId }
      });

      if (conteoDestino > 0) {
        throw new Error("El ciclo destino ya tiene asignaciones cargadas.");
      }

      // 2. Traemos las asignaciones del ciclo anterior
      const asignacionesAnteriores = await tx.asignacionAcademica.findMany({
        where: { idCiclo: cicloOrigenId },
      });

      if (asignacionesAnteriores.length === 0) {
        throw new Error("No se encontraron asignaciones en el ciclo origen.");
      }

      // 3. Preparamos los nuevos datos (sin los IDs viejos)
      const nuevosDatos = asignacionesAnteriores.map((asig) => ({
        idProfesor: asig.idProfesor,
        idMateria: asig.idMateria,
        idCurso: asig.idCurso,
        idCiclo: cicloDestinoId,
        cargaHoraria: asig.cargaHoraria,
        estado: true,
      }));

      // 4. Inserción masiva
      await tx.asignacionAcademica.createMany({
        data: nuevosDatos,
      });

      revalidatePath("/dashboard/profesores");
      return { success: true };
    });
  } catch (error: any) {
    return { error: error.message || "Error al clonar asignaciones" };
  }
}