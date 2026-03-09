import db from "@/lib/db";
import { getCicloActual } from "@/lib/ciclo-session";
import { DiaSemana } from "@prisma/client";

export const ProfesorService = {
async getAll(idCiclo: number) {
    return await db.profesor.findMany({
      where: {
        persona: {
          usuario: { estado: true }
        }
      },
      include: {
        persona: true,
        asignaciones: {
          where: {
            estado: true,
            idCiclo: idCiclo
          },
          include: {
            materia: true,
            curso: true,
            profesor: {
              include: { persona: true }
            }
          }
        }
      },
      orderBy: { persona: { apellido: "asc" } }
    });
  },

  async getPersonasDisponibles() {
    return await db.persona.findMany({
      where: {
        usuario: {
          estado: true,
          roles: { some: { rol: { nombre: "DOCENTE" } } }
        }
      },
      orderBy: {
        apellido: "asc"
      }
    });
  },

async asignarProfesor(idPersona: number, idMateria: number, idCurso: number, idCiclo: number, slots: { dia: string, hora: string }[]) {
    return await db.$transaction(async (tx) => {

    const tronoOcupado = await tx.asignacionAcademica.findFirst({
      where: { idMateria, idCurso, idCiclo, estado: true }
    });
    if (tronoOcupado) throw new Error("Esta materia ya tiene un docente activo.");

    for (const slot of slots) {
      const conflicto = await tx.horario.findFirst({
        where: {
          asignacion: { idProfesor: idPersona, idCiclo, estado: true },
          diaSemana: slot.dia as DiaSemana,
          horaInicio: slot.hora.split(" - ")[0]
        }
      });
      if (conflicto) throw new Error(`El docente ya tiene otra clase el ${slot.dia} a esa hora.`);
    }

      const existeActiva = await tx.asignacionAcademica.findFirst({
        where: {
          idMateria,
          idCurso,
          idCiclo,
          estado: true
        },
        include: { profesor: { include: { persona: true } } }
      });

      if (existeActiva) {
        throw new Error(`¡Cuidado! ${existeActiva.profesor.persona.apellido} ya está activo en esta materia. Primero debés darle la baja.`);
      }


      const profesor = await tx.profesor.upsert({
        where: { idPersona: idPersona },
        update: {},
        create: { idPersona, fechaIngreso: new Date() }
      });

      const asignacion = await tx.asignacionAcademica.create({
        data: {
          idProfesor: profesor.idProfesor,
          idMateria,
          idCurso,
          idCiclo: idCiclo,
          cargaHoraria: 4 * slots.length,
          estado: true
        }
      });

      for (const slot of slots) {
        const [horaInicio, horaFin] = slot.hora.split(" - ");
        await tx.horario.create({
          data: {
            idAsignacion: asignacion.idAsignacion,
            diaSemana: slot.dia as DiaSemana,
            horaInicio,
            horaFin,
          }
        });
      }
      return asignacion;
    });
  },

async eliminarAsignacion(idAsignacion: number) {
    return await db.asignacionAcademica.update({
      where: { idAsignacion },
      data: { estado: false }
    });
  },

  async updateAsignacion(idAsignacion: number, data: { idMateria?: number, idCurso?: number }, slots: { dia: string, hora: string }[]) {
    return await db.$transaction(async (tx) => {
      await tx.horario.deleteMany({
        where: { idAsignacion: idAsignacion }
      });

      for (const slot of slots) {
        const [horaInicio, horaFin] = slot.hora.split(" - ");
        await tx.horario.create({
          data: {
            idAsignacion: idAsignacion,
            diaSemana: slot.dia as DiaSemana,
            horaInicio,
            horaFin,
          }
        });
      }

      return await tx.asignacionAcademica.update({
        where: { idAsignacion },
        data: {
          ...data,
          cargaHoraria: 4 * slots.length,
        }
      });
    });
  },

  async getMaterias() {
    return await db.materia.findMany({ orderBy: { nombre: "asc" } });
  },

  async getHistorialAsignaciones() {
  const idCiclo = await getCicloActual();
  return await db.asignacionAcademica.findMany({
    where: {
      estado: false,
      idCiclo: idCiclo
    },
    include: {
      profesor: {
        include: { persona: true }
      },
      materia: true,
      curso: true
    },
    orderBy: {
      idAsignacion: 'desc'
    }
  });
},

async borrarAsignacionDefinitivamente(idAsignacion: number) {
  return await db.$transaction(async (tx) => {
    await tx.horario.deleteMany({ where: { idAsignacion } });

    return await tx.asignacionAcademica.delete({ where: { idAsignacion } });
  });
},

async darDeBaja(idAsignacion: number, motivo: string) {
  return await db.asignacionAcademica.update({
    where: { idAsignacion },
    data: {
      estado: false,
      motivoBaja: motivo,
      fechaBaja: new Date()
    }
  });
},

async reemplazarProfesor(idAsignacionOriginal: number, motivo: string, idPersonaSuplente: number) {
    return await db.$transaction(async (tx) => {
      // 1. Obtener datos de la asignación original
      const asignacionOriginal = await tx.asignacionAcademica.findUnique({
        where: { idAsignacion: idAsignacionOriginal }
      });

      if (!asignacionOriginal) {
        throw new Error("La asignación a reemplazar no existe.");
      }

      // 2. Dar de baja la asignación original
      await tx.asignacionAcademica.update({
        where: { idAsignacion: idAsignacionOriginal },
        data: {
          estado: false,
          motivoBaja: motivo,
          fechaBaja: new Date(),
        }
      });

      // 3. Asegurar que el suplente exista como profesor
      const profesorSuplente = await tx.profesor.upsert({
        where: { idPersona: idPersonaSuplente },
        update: {},
        create: { idPersona: idPersonaSuplente, fechaIngreso: new Date() }
      });

      // 4. Crear la nueva asignación para el suplente
      const nuevaAsignacion = await tx.asignacionAcademica.create({
        data: {
          idProfesor: profesorSuplente.idProfesor,
          idMateria: asignacionOriginal.idMateria,
          idCurso: asignacionOriginal.idCurso,
          idCiclo: asignacionOriginal.idCiclo,
          cargaHoraria: asignacionOriginal.cargaHoraria,
          estado: true,
        }
      });

      // 5. Mover horarios y notas a la nueva asignación para mantener el historial
      await tx.horario.updateMany({
        where: { idAsignacion: idAsignacionOriginal },
        data: { idAsignacion: nuevaAsignacion.idAsignacion }
      });

      await tx.nota.updateMany({
        where: { idAsignacion: idAsignacionOriginal },
        data: { idAsignacion: nuevaAsignacion.idAsignacion }
      });


      return nuevaAsignacion;
    });
  },

async reincorporarDocente(idAsignacion: number) {
  return await db.$transaction(async (tx) => {
    const asig = await tx.asignacionAcademica.findUnique({
      where: { idAsignacion },
      include: { materia: true, curso: true, profesor: { include: { persona: true } } }
    });

    if (!asig) throw new Error("Asignación no encontrada");
    if (asig.estado) return asig; // Ya está activo

    const reemplazante = await tx.asignacionAcademica.findFirst({
      where: {
        idMateria: asig.idMateria,
        idCurso: asig.idCurso,
        idCiclo: asig.idCiclo,
        estado: true,
      },
    });

    if (reemplazante) {
      await tx.asignacionAcademica.update({
        where: { idAsignacion: reemplazante.idAsignacion },
        data: {
          estado: false,
          motivoBaja: `Reemplazado por reincorporación de ${asig.profesor.persona.nombre} ${asig.profesor.persona.apellido}`,
          fechaBaja: new Date(),
        }
      });
      
      // Mover historial de vuelta a la asignación original
      await tx.nota.updateMany({
        where: { idAsignacion: reemplazante.idAsignacion },
        data: { idAsignacion: idAsignacion }
      });
      await tx.horario.updateMany({
        where: { idAsignacion: reemplazante.idAsignacion },
        data: { idAsignacion: idAsignacion }
      });
    }

    return await tx.asignacionAcademica.update({
      where: { idAsignacion },
      data: {
        estado: true,
        motivoBaja: null,
        fechaBaja: null
      }
    });
  });
}



};
