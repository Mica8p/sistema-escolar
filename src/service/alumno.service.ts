import db from "@/lib/db";
import { EstadoAcademico } from "@prisma/client";
import { getCicloActual } from "@/lib/ciclo-session";

export const AlumnoService = {
  // 1. Obtener alumnos para la tabla (incluyendo su curso actual)
  async getAll(idCiclo: number) {
    return await db.alumno.findMany({
      where: {
        // Solo alumnos que tienen matricula en el ciclo actual
        matriculas: {
          some: {
            idCiclo: idCiclo
          }
        }
      },
      include: {
        persona: true,
        matriculas: {
          where: {
            idCiclo: idCiclo // Nos aseguramos de traer la matrícula del ciclo correcto
          },
          include: {
            curso: true
          }
        }
      },
      orderBy: { persona: { apellido: "asc" } }
    });
  },

  // 2. Para el SELECT del formulario: Personas con rol ALUMNO que aún NO están inscritas en el CICLO ACTUAL
  async getPersonasDisponibles(idCiclo: number) {
    return await db.persona.findMany({
      where: {
        usuario: {
          roles: { some: { rol: { nombre: 'ALUMNO' } } },
          // No requerimos estado: true para alumnos, ya que no se loguean.
          passwordHash: { not: "DELETED_USER" }, // Pero evitamos los eliminados.
        },
        NOT: {
          alumno: {
            matriculas: {
              some: {
                idCiclo: idCiclo,
              },
            },
          },
        },
      },
      orderBy: { apellido: 'asc' },
    });
  },

  // 3. Para el SELECT del formulario: Cursos disponibles (lo que hace Gabriel)
  async getCursosDisponibles() {
  return await db.curso.findMany({
    orderBy: [
      { nivel: "asc" },
      { grado: "asc" },
      { seccion: "asc" }, // Agregamos sección para que no aparezcan mezcladas
      { turno: "asc" }   // Agregamos turno para que el administrativo los vea ordenados
    ]
  });
},

  // 4. La transacción de inscripción (que ya arreglamos antes)
  async enroll(idPersona: number, idCurso: number) {
    const idCiclo = await getCicloActual(); // <--- DINÁMICO

    return await db.$transaction(async (tx) => {
      // CAMBIO 1: Buscamos si la persona ya existe en la tabla 'alumno'
      let alumno = await tx.alumno.findUnique({
        where: { idPersona }
      });

      // CAMBIO 2: Si NO existe, lo creamos. Si existe, usamos el que ya está.
      if (!alumno) {
        alumno = await tx.alumno.create({
          data: {
            idPersona: idPersona,
            legajo: `LEG-${idPersona}-${new Date().getFullYear()}`,
            fechaNacimiento: new Date(), // Esto luego lo traeremos de la Persona
          }
        });
        console.log("✅ Ficha de Alumno creada exitosamente.");
      }

      // CAMBIO 3: Creamos la Matrícula vinculando el Alumno con el Curso
      const matricula = await tx.matricula.create({
        data: {
          idAlumno: alumno.idAlumno,
          idCurso: idCurso,
          idCiclo: idCiclo, // <--- USAMOS EL SELECCIONADO
          fechaInscripcion: new Date(),
          estadoAcademico: EstadoAcademico.Activo,
        }
      });

      return { alumno, matricula };
    });
  },

  async getById(idAlumno: number) {
    const idCiclo = await getCicloActual();
    return await db.alumno.findUnique({
      where: { idAlumno: idAlumno },
      include: {
        persona: true,
        matriculas: {
          where: { idCiclo },
          include: {
            curso: true,
            notas: {
              include: {
                asignacion: {
                  include: {
                    materia: true,
                  },
                },
              },
            },
          },
          orderBy: { fechaInscripcion: 'desc' },
        },
        cargos: {
          include: {
            concepto: true,
          },
          orderBy: { fechaVencimiento: 'asc' },
        },
        padres: {
          include: {
            padre: {
              include: {
                persona: true,
              },
            },
          },
        },
      },
    });
  },

  // 5. Obtener alumnos asociados a un padre
  async getAlumnosDePadre(idPadre: number) {
    return await db.alumno.findMany({
      where: {
        padres: { some: { idPadre: idPadre } }
      },
      include: {
        persona: true
      }
    });
  },

  // 6. Cambiar estado de matrícula (Para Bajas o Egresos sin borrar a la persona)
  async updateEstadoMatricula(idMatricula: number, nuevoEstado: EstadoAcademico) {
    return await db.matricula.update({
      where: { idMatricula },
      data: { estadoAcademico: nuevoEstado }
    });
  },

  async updateMatriculaCurso(idMatricula: number, idCurso: number) {
    return await db.matricula.update({
        where: { idMatricula },
        data: { idCurso: idCurso }
    });
  },
};