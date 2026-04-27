"use server";

import { revalidatePath } from "next/cache";
import { TipoEvaluacion } from "@prisma/client";
import { auth } from "@/auth";
import db from "@/lib/db";
import { guardarNota } from "@/service/calificaciones.service";

function parseTipo(v: string): TipoEvaluacion {
  if (v === "Parcial" || v === "Recuperatorio") return v;
  throw new Error("Tipo de evaluación inválido.");
}

export async function guardarNotaAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("No autorizado");

    const { roles, idPersona } = session.user;
    const isAdmin = roles.includes("ADMIN");

    console.log("Usuario:", { roles, idPersona });

    const idMatricula = Number(formData.get("idMatricula"));
    const idAsignacion = Number(formData.get("idAsignacion"));
    const idPeriodo = Number(formData.get("idPeriodo"));
    const tipo = parseTipo(String(formData.get("tipo")));
    const nota = Number(formData.get("nota"));
    const observacion = (formData.get("observacion") as string | null) ?? null;

    console.log("Params:", { idMatricula, idAsignacion, idPeriodo, tipo, nota, observacion });

    if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
      throw new Error("La nota debe estar entre 0 y 10.");
    }

    if (!isAdmin) {
      if (!idPersona) throw new Error("No autorizado");
      const prof = await db.profesor.findUnique({
        where: { idPersona },
        select: { idProfesor: true },
      });
      if (!prof) throw new Error("No eres un docente");
      console.log("Profesor encontrado:", prof.idProfesor);
      const asig = await db.asignacionAcademica.findUnique({
        where: { idAsignacion },
        select: { idProfesor: true, estado: true },
      });
      console.log("Asignación encontrada:", asig);
      if (!asig || asig.idProfesor !== prof.idProfesor || !asig.estado) {
        throw new Error("No tenés permiso para esta asignación.");
      }
    }

    // Verificar que la asignación existe
    const asigExists = await db.asignacionAcademica.findUnique({
      where: { idAsignacion },
    });
    if (!asigExists) throw new Error("Asignación no encontrada");

    await guardarNota({ idMatricula, idAsignacion, idPeriodo, tipo, nota, observacion });

    console.log("Nota guardada:", { idMatricula, idAsignacion, idPeriodo, tipo, nota, observacion });

    // Revalidar la página de calificaciones y forzar revalidación del layout
    revalidatePath("/dashboard/calificaciones", "page");
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error desconocido" };
  }
}

export async function deleteCalificacion(idNota: number) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "No autorizado" };

  const isAdmin = session.user.roles.includes("ADMIN");
  const idProfesor = session.user.idProfesor;

  try {
    const nota = await db.nota.findUnique({
      where: { idNota },
      include: { asignacion: { select: { idProfesor: true } } },
    });

    if (!nota) return { success: false, message: "La calificación no existe." };

    if (!isAdmin) {
      if (!idProfesor) {
        return { success: false, message: "Solo un docente puede eliminar sus calificaciones." };
      }
      if (nota.asignacion.idProfesor !== idProfesor) {
        return { success: false, message: "No tenés permiso para eliminar esta calificación." };
      }
    }

    await db.nota.delete({ where: { idNota } });

    revalidatePath("/dashboard/calificaciones");
    return { success: true };
  } catch {
    return { success: false, message: "No se pudo eliminar la calificación." };
  }
}
