"use server";

import db from "@/lib/db";
import { auth } from "@/auth";
import { EstadoAsistencia } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function guardarAsistenciaAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) throw new Error("No autorizado");

    const idMatricula = Number(formData.get("idMatricula"));
    const idHorario = Number(formData.get("idHorario"));
    const fechaStr = formData.get("fecha") as string;
    const estado = formData.get("estado") as EstadoAsistencia;

    if (!idMatricula || !idHorario || !fechaStr || !estado) {
      throw new Error("Faltan datos para registrar la asistencia");
    }

    const fecha = new Date(fechaStr + 'T12:00:00');
    fecha.setHours(0, 0, 0, 0);

    const idUsuarioCarga = session.user.idUsuario;
    if (!idUsuarioCarga) throw new Error("Usuario de carga no identificado");

    const fechaRegistro = new Date();

    const existente = await db.asistencia.findFirst({
      where: { idMatricula, idHorario, fecha }
    });

    if (existente) {
      await db.asistencia.update({
        where: { idAsistencia: existente.idAsistencia },
        data: {
          estado,
          idUsuario: idUsuarioCarga,
          fechaRegistro
        }
      });
    } else {
      await db.asistencia.create({
        data: {
          idMatricula,
          idHorario,
          fecha,
          estado,
          idUsuario: idUsuarioCarga,
          fechaRegistro
        }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/asistencias");

    return { success: true };
  } catch (error: unknown) {
    console.error("Error en guardarAsistenciaAction:", error);
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export async function getEstadisticasAsistenciaAction(idAsignacion: number) {
  try {
    const asig = await db.asignacionAcademica.findUnique({
      where: { idAsignacion: Number(idAsignacion) },
      include: { curso: true, ciclo: true },
    });

    if (!asig) throw new Error("Asignación no encontrada");

    // Obtener todas las asistencias del curso en el ciclo actual
    const asistencias = await db.asistencia.findMany({
      where: {
        matricula: {
          idCurso: asig.idCurso,
          idCiclo: asig.idCiclo,
          estadoAcademico: "Activo"
        }
      }
    });

    // Calcular estadísticas por alumno
    const estadisticasMap = new Map<number, { presentes: number; ausentes: number; totalClases: number }>();

    for (const asistencia of asistencias) {
      const idMatricula = asistencia.idMatricula;
      const estado = asistencia.estado;

      if (!estadisticasMap.has(idMatricula)) {
        estadisticasMap.set(idMatricula, { presentes: 0, ausentes: 0, totalClases: 0 });
      }

      const stats = estadisticasMap.get(idMatricula)!;
      stats.totalClases += 1;

      if (estado === "Presente" || estado === "Justificado") {
        stats.presentes += 1;
      } else if (estado === "Ausente") {
        stats.ausentes += 1;
      } else if (estado === "Tarde") {
        // Las tardes cuentan como media presente (2 tardes = 1 presente)
        stats.presentes += 0.5;
      }
    }

    // Convertir Map a array para serializar
    return Array.from(estadisticasMap.entries());
  } catch (error: unknown) {
    console.error("Error en getEstadisticasAsistenciaAction:", error);
    return [];
  }
}

export async function getEstadisticasAsistenciasPorMateriaAction(
  idCurso: number,
  idMateria: number,
  idCiclo: number
) {
  try {
    // Primero obtener las asignaciones académicas que correspondan
    const asignaciones = await db.asignacionAcademica.findMany({
      where: {
        idCurso,
        idCiclo,
        materia: {
          idMateria
        }
      },
      select: { idAsignacion: true }
    });

    const idsAsignaciones = asignaciones.map(a => a.idAsignacion);

    if (idsAsignaciones.length === 0) {
      return [];
    }

    // Obtener todas las asistencias de esas asignaciones
    const asistencias = await db.asistencia.findMany({
      where: {
        matricula: {
          idCurso,
          idCiclo,
          estadoAcademico: "Activo"
        },
        horario: {
          idAsignacion: {
            in: idsAsignaciones
          }
        }
      },
      include: {
        matricula: {
          include: {
            alumno: {
              include: {
                persona: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Calcular estadísticas por estudiante
    const estadisticasMap = new Map<number, {
      idMatricula: number;
      nombreAlumno: string;
      presentes: number;
      ausentes: number;
      tardios: number;
      justificados: number;
      totalClases: number;
    }>();

    for (const asistencia of asistencias) {
      const idMatricula = asistencia.idMatricula;
      const estado = asistencia.estado;
      const nombreAlumno = `${asistencia.matricula.alumno.persona.apellido}, ${asistencia.matricula.alumno.persona.nombre}`;

      if (!estadisticasMap.has(idMatricula)) {
        estadisticasMap.set(idMatricula, {
          idMatricula,
          nombreAlumno,
          presentes: 0,
          ausentes: 0,
          tardios: 0,
          justificados: 0,
          totalClases: 0
        });
      }

      const stats = estadisticasMap.get(idMatricula)!;
      stats.totalClases += 1;

      if (estado === "Presente") {
        stats.presentes += 1;
      } else if (estado === "Ausente") {
        stats.ausentes += 1;
      } else if (estado === "Tarde") {
        stats.tardios += 1;
      } else if (estado === "Justificado") {
        stats.justificados += 1;
      }
    }

    // Convertir Map a array y ordenar por nombre
    return Array.from(estadisticasMap.values()).sort((a, b) => 
      a.nombreAlumno.localeCompare(b.nombreAlumno)
    );
  } catch (error: unknown) {
    console.error("Error en getEstadisticasAsistenciasPorMateriaAction:", error);
    return [];
  }
}