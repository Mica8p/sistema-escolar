"use server";

import { revalidatePath } from "next/cache";
import { TipoEvaluacion } from "@prisma/client";
import { auth } from "@/auth";
import db from "@/lib/db";
import { guardarNota, getAsignacionesParaUsuario } from "@/service/calificaciones.service";
import { getCicloActual } from "@/lib/ciclo-session";

function parseTipo(v: string): TipoEvaluacion {
  if (v === "Parcial" || v === "Final" || v === "Recuperatorio") return v;
  throw new Error("Tipo de evaluación inválido.");
}

export async function guardarNotaAction(_: any, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const { roles, idPersona } = session.user;
  const isAdmin = roles.includes("ADMIN");

  const idMatricula = Number(formData.get("idMatricula"));
  const idAsignacion = Number(formData.get("idAsignacion"));
  const idPeriodo = Number(formData.get("idPeriodo"));
  const tipo = parseTipo(String(formData.get("tipo")));
  const nota = Number(formData.get("nota"));
  const observacion = (formData.get("observacion") as string | null) ?? null;

  if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
    throw new Error("La nota debe estar entre 0 y 10.");
  }

  if (!isAdmin) {
    if (!idPersona) throw new Error("No autorizado");
    const idCiclo = await getCicloActual();
    const asigs = await getAsignacionesParaUsuario({ isAdmin, idPersona, idCiclo });

    const permitida = asigs.some((a) => a.idAsignacion === idAsignacion);
    if (!permitida) throw new Error("No tenés permiso para esta asignación.");
  }

  await guardarNota({ idMatricula, idAsignacion, idPeriodo, tipo, nota, observacion });

  revalidatePath("/dashboard/calificaciones");
  return { ok: true };
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

export async function cambiarEstadoPeriodoAction(idPeriodo: number, cerrado: boolean) {
  const session = await auth();
  if (!session?.user.roles.includes("ADMIN")) {
    throw new Error("Solo el personal administrativo puede cerrar periodos.");
  }

  // Si está intentando CERRAR el período, validar notas
  if (cerrado) {
    const { validarNotasFaltantesPeriodo } = await import("@/service/calificaciones.service");
    const validacion = await validarNotasFaltantesPeriodo(idPeriodo);
    
    if (!validacion.ok) {
      throw new Error(validacion.mensaje || 'No se puede cerrar el período');
    }
  }

  await db.periodoAcademico.update({
    where: { idPeriodo },
    data: { cerrado }
  });

  revalidatePath("/dashboard/calificaciones");
  return { success: true };
}