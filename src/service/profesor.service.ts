import db from "@/lib/db";

export const ProfesorService = {
  // 1. Obtener profesores e incluir SOLO las asignaciones que están ACTIVAS
async getAll() {
  return await db.profesor.findMany({
    where: {
      asignaciones: { some: { estado: true } }
    },
    include: {
      persona: true,
      asignaciones: {
        where: { estado: true },
        include: {
          materia: true,
          curso: true,
          // AQUÍ ESTÁ EL CAMBIO:
          // No solo traemos al profesor, sino también su persona
          profesor: {
            include: {
              persona: true
            }
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
async asignarProfesor(idPersona: number, idMateria: number, idCurso: number) {
  return await db.$transaction(async (tx) => {
    // 1. REGLA PRO: ¿Ya hay un docente dando esta materia HOY?
    // Buscamos si existe alguna asignación para este curso/materia que esté ACTIVA
    const asignacionActiva = await tx.asignacionAcademica.findFirst({
      where: {
        idMateria,
        idCurso,
        idCiclo: 1, // Ciclo 2026
        estado: true
      }
    });

    if (asignacionActiva) {
      throw new Error("Ya existe un docente activo. Debes darle de 'Baja' antes de asignar un reemplazo.");
    }

    // 2. Si no hay nadie activo, creamos la ficha del profesor (si no existe)
    const profesor = await tx.profesor.upsert({
      where: { idPersona: idPersona },
      update: {},
      create: { idPersona, fechaIngreso: new Date() }
    });

    // 3. Creamos la NUEVA asignación. Esta será la "fila nueva" en el historial
    return await tx.asignacionAcademica.create({
      data: {
        idProfesor: profesor.idProfesor,
        idMateria,
        idCurso,
        idCiclo: 1,
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
  return await db.asignacionAcademica.findMany({
    where: {
      estado: false, // Solo las que fueron dadas de baja
      idCiclo: 1     // Del año actual
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