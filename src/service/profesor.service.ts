import db from "@/lib/db";
import { getCicloActual } from "@/lib/ciclo-session";
import { DiaSemana } from "@prisma/client";

export const ProfesorService = {
async getAll(idCiclo: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const whereCondition = {
      persona: {
        usuario: { estado: true }
      },
      asignaciones: {
        some: {
          idCiclo: idCiclo,
          estado: true
        }
      }
    };

    const [profesores, total] = await Promise.all([
      db.profesor.findMany({
        where: whereCondition,
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
        orderBy: { persona: { apellido: "asc" } },
        skip,
        take: limit
      }),
      db.profesor.count({ where: whereCondition })
    ]);

    return { profesores, total };
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
    // 1. Obtener o crear el profesor primero
    const profesor = await tx.profesor.upsert({
      where: { idPersona: idPersona },
      update: {},
      create: { idPersona, fechaIngreso: new Date() }
    });

    // 2. Validar que la materia no esté asignada a otro docente activo
    const tronoOcupado = await tx.asignacionAcademica.findFirst({
      where: { idMateria, idCurso, idCiclo, estado: true }
    });
    if (tronoOcupado) throw new Error("Esta materia ya tiene un docente activo.");

    // 3. Validar conflictos de horario del profesor y del curso
    for (const slot of slots) {
      const [newHoraInicio, newHoraFin] = slot.hora.split(" - ");
      
      // Convertir a minutos para comparación más precisa
      const [newHH, newMM] = newHoraInicio.split(":").map(Number);
      const [newHHFin, newMMFin] = newHoraFin.split(":").map(Number);
      const nuevoInicioMinutos = newHH * 60 + newMM;
      const nuevoFinMinutos = newHHFin * 60 + newMMFin;
      
      // 3a. Validar conflictos del profesor (no puede estar en otro curso a la misma hora)
      const horariosProfesor = await tx.horario.findMany({
        where: {
          asignacion: { 
            idProfesor: profesor.idProfesor,
            idCiclo, 
            estado: true 
          },
          diaSemana: slot.dia as DiaSemana,
        },
      });

      // Verificar solapamiento con cada horario existente del profesor
      for (const conflictoProfesor of horariosProfesor) {
        const [hh, mm] = conflictoProfesor.horaInicio.split(":").map(Number);
        const [hhFin, mmFin] = conflictoProfesor.horaFin.split(":").map(Number);
        const inicioMinutos = hh * 60 + mm;
        const finMinutos = hhFin * 60 + mmFin;
        
        // Verificar solapamiento: NO hay solapamiento si (fin1 <= inicio2 OR inicio1 >= fin2)
        const hayInterseccion = !(nuevoFinMinutos <= inicioMinutos || nuevoInicioMinutos >= finMinutos);
        
        if (hayInterseccion) {
          throw new Error(
            `El docente ya tiene otra clase el ${slot.dia} de ${conflictoProfesor.horaInicio} a ${conflictoProfesor.horaFin}.`
          );
        }
      }

      // 3b. Validar conflictos en el curso (otro profesor no puede tener clase en el mismo horario)
      const horariosCurso = await tx.horario.findMany({
        where: {
          asignacion: {
            idCurso: idCurso,
            idCiclo: idCiclo,
            estado: true
          },
          diaSemana: slot.dia as DiaSemana,
        },
        include: {
          asignacion: {
            include: {
              profesor: {
                include: { persona: true }
              },
              materia: true,
              curso: true
            }
          }
        }
      });

      for (const conflictoCurso of horariosCurso) {
        const [hh, mm] = conflictoCurso.horaInicio.split(":").map(Number);
        const [hhFin, mmFin] = conflictoCurso.horaFin.split(":").map(Number);
        const inicioMinutos = hh * 60 + mm;
        const finMinutos = hhFin * 60 + mmFin;
        
        // Verificar solapamiento
        const hayInterseccion = !(nuevoFinMinutos <= inicioMinutos || nuevoInicioMinutos >= finMinutos);
        
        if (hayInterseccion) {
          const nombreProfesor = conflictoCurso.asignacion.profesor?.persona
            ? `${conflictoCurso.asignacion.profesor.persona.apellido} ${conflictoCurso.asignacion.profesor.persona.nombre}`
            : "Otro profesor";
          const nombreMateria = conflictoCurso.asignacion.materia?.nombre || "una materia";
          const nombreCurso = conflictoCurso.asignacion.curso
            ? `${conflictoCurso.asignacion.curso.grado}°${conflictoCurso.asignacion.curso.seccion}`
            : "este curso";
          throw new Error(
            `En el ${nombreCurso} ya hay una clase el ${slot.dia}: ${nombreProfesor} tiene ${nombreMateria} de ${conflictoCurso.horaInicio} a ${conflictoCurso.horaFin}.`
          );
        }
      }
    }

    // 4. Validar que no exista una asignación activa de esta materia+curso
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
      const nombreProfesor = existeActiva.profesor?.persona
        ? `${existeActiva.profesor.persona.apellido} ${existeActiva.profesor.persona.nombre}`
        : "otro docente";
      throw new Error(`¡Cuidado! ${nombreProfesor} ya está activo en esta materia. Primero debés darle la baja.`);
    }

    // 5. Crear la asignación académica
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
      const asignacion = await tx.asignacionAcademica.findUnique({
        where: { idAsignacion },
        select: { idProfesor: true, idCiclo: true, idCurso: true },
      });

      if (!asignacion) {
        throw new Error("Asignación no encontrada");
      }

      // Usar el nuevo idCurso si se proporciona, si no usar el actual
      const idCursoFinal = data.idCurso || asignacion.idCurso;

      for (const slot of slots) {
        const [newHoraInicio, newHoraFin] = slot.hora.split(" - ");
        
        // Convertir a minutos para comparación más precisa
        const [newHH, newMM] = newHoraInicio.split(":").map(Number);
        const [newHHFin, newMMFin] = newHoraFin.split(":").map(Number);
        const nuevoInicioMinutos = newHH * 60 + newMM;
        const nuevoFinMinutos = newHHFin * 60 + newMMFin;

        // Validar conflictos del profesor (no puede estar en otro curso a la misma hora)
        const horariosProfesor = await tx.horario.findMany({
          where: {
            idAsignacion: { not: idAsignacion },
            asignacion: {
              idProfesor: asignacion.idProfesor,
              idCiclo: asignacion.idCiclo,
              estado: true,
            },
            diaSemana: slot.dia as DiaSemana,
          },
        });

        // Verificar solapamiento con cada horario existente del profesor
        for (const conflicto of horariosProfesor) {
          const [hh, mm] = conflicto.horaInicio.split(":").map(Number);
          const [hhFin, mmFin] = conflicto.horaFin.split(":").map(Number);
          const inicioMinutos = hh * 60 + mm;
          const finMinutos = hhFin * 60 + mmFin;
          
          // Verificar solapamiento: NO hay solapamiento si (fin1 <= inicio2 OR inicio1 >= fin2)
          const hayInterseccion = !(nuevoFinMinutos <= inicioMinutos || nuevoInicioMinutos >= finMinutos);
          
          if (hayInterseccion) {
            throw new Error(
              `El docente ya tiene otra clase el ${slot.dia} de ${conflicto.horaInicio} a ${conflicto.horaFin}.`
            );
          }
        }

        // Validar conflictos en el curso (otro profesor no puede tener clase en el mismo horario)
        const horariosCurso = await tx.horario.findMany({
          where: {
            idAsignacion: { not: idAsignacion },
            asignacion: {
              idCurso: idCursoFinal,
              idCiclo: asignacion.idCiclo,
              estado: true
            },
            diaSemana: slot.dia as DiaSemana,
          },
          include: {
            asignacion: {
              include: {
                profesor: {
                  include: { persona: true }
                },
                materia: true,
                curso: true
              }
            }
          }
        });

        // Verificar solapamiento con cada horario existente en el curso
        for (const conflicto of horariosCurso) {
          const [hh, mm] = conflicto.horaInicio.split(":").map(Number);
          const [hhFin, mmFin] = conflicto.horaFin.split(":").map(Number);
          const inicioMinutos = hh * 60 + mm;
          const finMinutos = hhFin * 60 + mmFin;
          
          // Verificar solapamiento
          const hayInterseccion = !(nuevoFinMinutos <= inicioMinutos || nuevoInicioMinutos >= finMinutos);
          
          if (hayInterseccion) {
            const nombreProfesor = conflicto.asignacion.profesor?.persona
              ? `${conflicto.asignacion.profesor.persona.apellido} ${conflicto.asignacion.profesor.persona.nombre}`
              : "Otro profesor";
            const nombreMateria = conflicto.asignacion.materia?.nombre || "una materia";
            const nombreCurso = conflicto.asignacion.curso
              ? `${conflicto.asignacion.curso.grado}°${conflicto.asignacion.curso.seccion}`
              : "este curso";
            throw new Error(
              `En el ${nombreCurso} ya hay una clase el ${slot.dia}: ${nombreProfesor} tiene ${nombreMateria} de ${conflicto.horaInicio} a ${conflicto.horaFin}.`
            );
          }
        }
      }

      await tx.horario.deleteMany({
        where: { idAsignacion: idAsignacion },
      });

      for (const slot of slots) {
        const [horaInicio, horaFin] = slot.hora.split(" - ");
        await tx.horario.create({
          data: {
            idAsignacion: idAsignacion,
            diaSemana: slot.dia as DiaSemana,
            horaInicio,
            horaFin,
          },
        });
      }

      return await tx.asignacionAcademica.update({
        where: { idAsignacion },
        data: {
          ...data,
          cargaHoraria: 4 * slots.length,
        },
      });
    });
  },

  async getMaterias() {
    return await db.materia.findMany({ orderBy: { nombre: "asc" } });
  },

  async getHistorialAsignaciones(idCiclo?: number) {
    let cicloId = idCiclo;
    if (!cicloId) {
      cicloId = await getCicloActual();
    }
    return await db.asignacionAcademica.findMany({
      where: {
        estado: false,
        idCiclo: cicloId
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

    const profesorNombre = asig.profesor?.persona
      ? `${asig.profesor.persona.nombre} ${asig.profesor.persona.apellido}`
      : 'el profesor';

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
          motivoBaja: `Reemplazado por reincorporación de ${profesorNombre}`,
          fechaBaja: new Date(),
        },
      });

      await tx.nota.updateMany({
        where: { idAsignacion: reemplazante.idAsignacion },
        data: { idAsignacion: idAsignacion },
      });
      await tx.horario.updateMany({
        where: { idAsignacion: reemplazante.idAsignacion },
        data: { idAsignacion: idAsignacion },
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
},

async getAllByDay(idCiclo: number, diaSemana: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const whereCondition = {
    persona: {
      usuario: { estado: true }
    },
    asignaciones: {
      some: {
        idCiclo: idCiclo,
        estado: true,
        horarios: {
          some: {
            diaSemana: diaSemana as DiaSemana
          }
        }
      }
    }
  };

  const [profesores, total] = await Promise.all([
    db.profesor.findMany({
      where: whereCondition,
      include: {
        persona: true,
        asignaciones: {
          where: {
            estado: true,
            idCiclo: idCiclo,
            horarios: {
              some: {
                diaSemana: diaSemana as DiaSemana
              }
            }
          },
          include: {
            materia: true,
            curso: true,
            horarios: {
              where: {
                diaSemana: diaSemana as DiaSemana
              }
            }
          }
        }
      },
      orderBy: { persona: { apellido: "asc" } },
      skip,
      take: limit
    }),
    db.profesor.count({ where: whereCondition })
  ]);

  return { profesores, total };
}


};
