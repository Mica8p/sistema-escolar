import db from "@/lib/db";
import { getCicloActual } from "@/lib/ciclo-session";

export const ProfesorService = {
  // 1. Obtener profesores e incluir SOLO las asignaciones que están ACTIVAS
async getAll(idCiclo: number) { // <--- Agregamos idCiclo como parámetro
    return await db.profesor.findMany({
      where: {
        // Solo profesores que tienen asignaciones ACTIVAS en EL AÑO SELECCIONADO
        asignaciones: {
          some: {
            estado: true,
            idCiclo: idCiclo // <--- FILTRO DE SEGURIDAD 1
          }
        }
      },
      include: {
        persona: true,
        asignaciones: {
          where: {
            estado: true,
            idCiclo: idCiclo // <--- FILTRO DE SEGURIDAD 2
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

  // Personas con rol DOCENTE que aún no están dadas de alta como Profesores
  async getPersonasDisponibles() {
    return await db.persona.findMany({
      where: {
        usuario: {
          roles: { some: { rol: { nombre: "DOCENTE" } } }
        },
        profesor: { is: null }
      }
    });
  },

  // Crear profesor y asignar su primera materia/curso
async asignarProfesor(idPersona: number, idMateria: number, idCurso: number, idCiclo: number) {

    // IMPORTANTE: Ya no llamamos a getCicloActual() aquí adentro.
    // Usamos el idCiclo que nos llega desde la Action.

    return await db.$transaction(async (tx) => {
      // Regla de seguridad: ¿Ya hay alguien dando esta materia en ESTE ciclo?
      const asignacionActiva = await tx.asignacionAcademica.findFirst({
        where: {
          idMateria,
          idCurso,
          idCiclo: idCiclo, // <--- Usamos el parámetro
          estado: true
        }
      });

      if (asignacionActiva) {
        throw new Error("Ya existe un docente activo en este ciclo.");
      }

      const profesor = await tx.profesor.upsert({
        where: { idPersona: idPersona },
        update: {},
        create: { idPersona, fechaIngreso: new Date() }
      });

      return await tx.asignacionAcademica.create({
        data: {
          idProfesor: profesor.idProfesor,
          idMateria,
          idCurso,
          idCiclo: idCiclo, // <--- Usamos el parámetro
          cargaHoraria: 4,
          estado: true
        }
      });
    });
  },

  // NUEVA FUNCIÓN: "Borrado Lógico"
  // En lugar de borrar la fila de la base de datos, simplemente "apagamos" el estado
  async desactivarAsignacion(idAsignacion: number) {
    return await db.asignacionAcademica.update({
      where: { idAsignacion: idAsignacion },
      data: { estado: false } // Cambiamos el switch a falso
    });
  },

  // NUEVA FUNCIÓN: Editar Asignación
  // Permite corregir si el secretario se equivocó de curso o materia
  async updateAsignacion(idAsignacion: number, data: { idMateria?: number, idCurso?: number }) {
    return await db.asignacionAcademica.update({
      where: { idAsignacion },
      data
    });
  },

  // Auxiliares para los selectores
  async getMaterias() {
    return await db.materia.findMany({ orderBy: { nombre: "asc" } });
  },

  //Historial de asignaciones (bajas) de todos los profesores
  async getHistorialAsignaciones() {
  const idCiclo = await getCicloActual(); // <--- DINÁMICO
  return await db.asignacionAcademica.findMany({
    where: {
      estado: false, // Solo las que fueron dadas de baja
      idCiclo: idCiclo // <--- FILTRADO POR AÑO
    },
    include: {
      profesor: {
        include: { persona: true }
      },
      materia: true,
      curso: true
    },
    orderBy: {
      idAsignacion: 'desc' // Las más recientes primero
    }
  });
}

};