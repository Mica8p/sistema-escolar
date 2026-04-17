import db from "@/lib/db";
import { EstadoAcademico, Prisma } from "@prisma/client";
import { getCicloActual } from "@/lib/ciclo-session";

export const AlumnoService = {
  async getAll(idCiclo: number, estado?: string) {

    const matriculaWhere: Prisma.MatriculaWhereInput = {
      idCiclo: idCiclo,
    }

    if(estado && estado !== "Todos") {
      const mapEstados: Record<string, EstadoAcademico> = {
        "Activos": "Activo",
        "Baja": "Retirado",
        "Egresados": "Egresado",
        "Suspendidos": "Suspendido"
      };
      const estadoAcademico = mapEstados[estado];

      if (estadoAcademico) {
        matriculaWhere.estadoAcademico = { equals: estadoAcademico };
      }
    }

    return await db.alumno.findMany({
      where: {
        matriculas: {
          some: matriculaWhere
        }
      },
      include: {
        persona: true,
        matriculas: {
          where: {
            idCiclo: idCiclo
          },
          include: {
            curso: true
          }
        }
      },
      orderBy: { persona: { apellido: "asc" } }
    });
  },

  async getPersonasDisponibles(idCiclo: number) {
    return await db.persona.findMany({
      where: {
        usuario: {
          roles: { some: { rol: { nombre: 'ALUMNO' } } },
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

  async getCursosDisponibles() {
  return await db.curso.findMany({
    orderBy: [
      { nivel: "asc" },
      { grado: "asc" },
      { seccion: "asc" },
      { turno: "asc" }
    ]
  });
},

  async enroll(idPersona: number, idCurso: number, idCiclo?: number) {
    let cicloId = idCiclo;
    if (!cicloId) {
      cicloId = await getCicloActual();
    }

    return await db.$transaction(async (tx) => {
      let alumno = await tx.alumno.findUnique({
        where: { idPersona }
      });

      if (!alumno) {
        alumno = await tx.alumno.create({
          data: {
            idPersona: idPersona,
            legajo: `LEG-${idPersona}-${new Date().getFullYear()}`,
            fechaNacimiento: new Date(),
          }
        });
      }

      const matricula = await tx.matricula.create({
        data: {
          idAlumno: alumno.idAlumno,
          idCurso: idCurso,
          idCiclo: cicloId,
          fechaInscripcion: new Date(),
          estadoAcademico: EstadoAcademico.Activo,
        }
      });

      return { alumno, matricula };
    });
  },

  async getById(idAlumno: number, idCiclo?: number) {
    let cicloId = idCiclo;
    if (!cicloId) {
      cicloId = await getCicloActual();
    }
    return await db.alumno.findUnique({
      where: { idAlumno: idAlumno },
      include: {
        persona: true,
        matriculas: {
          where: { idCiclo: cicloId },
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

  async deleteMatricula(idMatricula: number) {
    const matricula = await db.matricula.findUnique({
      where: { idMatricula },
      include: { notas: true },
    });

    if (!matricula) {
      throw new Error('La matrícula no existe');
    }

    if (matricula.notas.length > 0) {
      throw new Error('No se puede eliminar la matrícula porque tiene notas cargadas.');
    }

    return db.matricula.delete({
      where: { idMatricula },
    });
  },
};