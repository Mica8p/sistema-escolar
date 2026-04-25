"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getCursosParaComunicado } from "@/service/curso.service";

export async function obtenerCursosDisponibles() {
  const session = await auth();

  if (!session?.user || !["ADMIN", "DOCENTE"].some(rol => session.user.roles?.includes(rol))) {
    return { error: "No tienes permisos", cursos: [] };
  }

  const roles = session.user.roles || [];
  const rol = roles.includes("ADMIN") ? "ADMIN" : "DOCENTE";
  const idProfesor = session.user.idProfesor || null;

  try {
    const cursos = await getCursosParaComunicado(rol, idProfesor);
    return { success: true, cursos };
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return { error: "No se pudieron obtener los cursos", cursos: [] };
  }
}

export async function enviarComunicado(formData: FormData) {
  const session = await auth();

  if (!session?.user || !["ADMIN", "DOCENTE"].some(rol => session.user.roles?.includes(rol))) {
    return { error: "No tienes permisos para enviar comunicados." };
  }

  const titulo = formData.get("titulo") as string;
  const contenido = formData.get("contenido") as string;
  const target = formData.get("target") as string;
  const idTargetRaw = formData.get("idTarget") as string;

  const idUsuario = session.user.idUsuario;
  const idTarget = idTargetRaw ? parseInt(idTargetRaw) : null;
  const idProfesor = session.user.idProfesor || null;
  const rolPrincipal = session.user.roles?.[0];

  try {
    // Validar que los docentes solo pueden enviar "PADRES_CURSOS_DOCENTE" sin curso específico
    if (rolPrincipal === "DOCENTE" && target === "PADRES_CURSOS_DOCENTE" && idTarget) {
      return { error: "Al enviar a 'Padres de todos mis cursos', no debes seleccionar un curso específico. El comunicado se enviará a los padres de TODOS tus cursos." };
    }

    // Validar que los docentes seleccionen un curso cuando usan "CURSO_PADRES"
    if (rolPrincipal === "DOCENTE" && target === "CURSO_PADRES" && !idTarget) {
      return { error: "Debes seleccionar un curso específico para enviar a los padres de ese curso." };
    }

    // Validar que el docente envíe a un curso que le pertenece (solo para docentes con CURSO_PADRES)
    if (rolPrincipal === "DOCENTE" && target === "CURSO_PADRES" && idTarget && idProfesor) {
      const cursoDelDocente = await db.asignacionAcademica.findFirst({
        where: {
          idProfesor: idProfesor,
          idCurso: idTarget,
          estado: true
        }
      });

      if (!cursoDelDocente) {
        return { error: "No puedes enviar comunicados a un curso que no es tuyo." };
      }
    }

    // Caso especial: docente enviando a "Padres de mis cursos"
    if (target === "PADRES_CURSOS_DOCENTE" && !idTarget && idProfesor) {
      // Verificar que el docente tenga cursos
      const cursosDocente = await db.asignacionAcademica.findMany({
        where: {
          idProfesor: idProfesor,
          estado: true
        },
        distinct: ['idCurso'],
        select: { idCurso: true }
      });

      if (cursosDocente.length === 0) {
        return { error: "No tienes cursos asignados para enviar este comunicado." };
      }

      // Crear UN ÚNICO comunicado para todos los padres de los cursos del docente
      await db.comunicado.create({
        data: {
          titulo,
          contenido,
          target: "PADRES_CURSOS_DOCENTE",
          idTarget: null, // Sin idTarget específico, el filtrado usa idUsuario (profesor que lo envía)
          idUsuario,
          fecha: new Date(),
        },
      });
    } else {
      // Caso normal: enviar un único comunicado
      await db.comunicado.create({
        data: {
          titulo,
          contenido,
          target,
          idTarget,
          idUsuario,
          fecha: new Date(),
        },
      });
    }

    revalidatePath("/dashboard/comunicados");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al enviar comunicado:", error);
    return { error: "Error interno al guardar el comunicado." };
  }
}

export async function marcarComoLeido(idComunicado: number) {
  const session = await auth();
  const idUsuario = session?.user?.idUsuario;

  if (!idUsuario) return { error: "Usuario no identificado" };

  try {
    await db.comunicadoVisto.upsert({
      where: {
        idComunicado_idUsuario: {
          idComunicado,
          idUsuario,
        },
      },
      update: {},
      create: {
        idComunicado,
        idUsuario,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/comunicados");
    return { success: true };
  } catch (error) {
    console.error("Error al marcar como leído:", error);
    return { error: "No se pudo actualizar el estado de lectura" };
  }
}

export async function editarComunicado(idComunicado: number, formData: FormData) {
  const session = await auth();

  if (!session?.user || !["ADMIN", "DOCENTE"].some(rol => session.user.roles?.includes(rol))) {
    return { error: "No tienes permisos para editar comunicados." };
  }

  const idUsuario = session.user.idUsuario;
  const titulo = formData.get("titulo") as string;
  const contenido = formData.get("contenido") as string;
  const target = formData.get("target") as string;
  const idTargetRaw = formData.get("idTarget") as string;
  const idTarget = idTargetRaw ? parseInt(idTargetRaw) : null;

  if (!titulo || !contenido || !target) {
    return { error: "Faltan datos requeridos" };
  }

  try {
    // Verificar que el comunicado existe y pertenece al usuario
    const comunicado = await db.comunicado.findUnique({
      where: { idComunicado },
      select: { idUsuario: true }
    });

    if (!comunicado) {
      return { error: "El comunicado no existe" };
    }

    if (comunicado.idUsuario !== idUsuario) {
      return { error: "No tienes permiso para editar este comunicado" };
    }

    // Actualizar el comunicado
    await db.comunicado.update({
      where: { idComunicado },
      data: {
        titulo,
        contenido,
        target,
        idTarget,
        fecha: new Date(), // Actualizar fecha de edición
      },
    });

    revalidatePath("/dashboard/comunicados");
    revalidatePath("/dashboard/comunicados/enviados");
    return { success: true };
  } catch (error) {
    console.error("Error al editar comunicado:", error);
    return { error: "Error interno al guardar los cambios." };
  }
}

export async function eliminarComunicado(idComunicado: number) {
  const session = await auth();
  if (!session || !session.user) return { error: "No autorizado" };
  const idUsuario = session.user.idUsuario;

  if (!idUsuario) return { error: "No autorizado" };

  try {
    const comunicado = await db.comunicado.findUnique({
      where: { idComunicado },
      select: { idUsuario: true }
    });

    const roles = session?.user?.roles ?? [];
    const esAdmin = roles.includes("ADMIN");

    if (comunicado?.idUsuario !== idUsuario && !esAdmin) {
      return { error: "No tienes permiso para eliminar este mensaje" };
    }

    await db.comunicadoVisto.deleteMany({
      where: { idComunicado }
    });

    await db.comunicado.delete({
      where: { idComunicado }
    });

    revalidatePath("/dashboard/comunicados");
    revalidatePath("/dashboard/comunicados/enviados");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar:", error);
    return { error: "No se pudo eliminar el comunicado" };
  }
}