import db from "@/lib/db";
import { EstadoAcademico } from "@prisma/client";

export const AlumnoService = {
  // 1. Obtener alumnos para la tabla (incluyendo su curso actual)
  async getAll() {
    return await db.alumno.findMany({
      include: {
        persona: true, // Traemos datos personales (nombre, dni)
        matriculas: {
          // Traemos la última matrícula para saber su curso actual
          orderBy: { fechaInscripcion: 'desc' },
          take: 1,
          include: {
            curso: true // Incluimos los datos del curso (grado, sección)
          }
        }
      },
      orderBy: { persona: { apellido: "asc" } }
    });
  },

  // 2. Para el SELECT del formulario: Personas con rol ALUMNO que aún NO están inscritas
  async getPersonasDisponibles() {
    return await db.persona.findMany({
      where: {
        usuario: {
          roles: { some: { rol: { nombre: "ALUMNO" } } },
          estado: true
        },
        // Este filtro es clave: solo trae a los que NO tienen ficha de alumno todavía
        alumno: { is: null }
      },
      orderBy: { apellido: "asc" }
    });
  },

  // 3. Para el SELECT del formulario: Cursos disponibles (lo que hace Gabriel)
  async getCursosDisponibles() {
    return await db.curso.findMany({
      orderBy: [{ nivel: "asc" }, { grado: "asc" }]
    });
  },

  // 4. La transacción de inscripción (que ya arreglamos antes)
  async enroll(idPersona: number, idCurso: number) {
    return await db.$transaction(async (tx) => {
      const nuevoAlumno = await tx.alumno.create({
        data: {
          idPersona: idPersona,
          legajo: `LEG-${idPersona}-${new Date().getFullYear()}`,
          fechaNacimiento: new Date(),
        }
      });

      await tx.matricula.create({
        data: {
          idAlumno: nuevoAlumno.idAlumno,
          idCurso: idCurso,
          idCiclo: 1, // Asumimos Ciclo ID 1 por ahora
          fechaInscripcion: new Date(),
          estadoAcademico: EstadoAcademico.Activo,
        }
      });

      return nuevoAlumno;
    });
  }
};