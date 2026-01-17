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
          idCiclo: 1, // ID del Ciclo 2026 definido en el seed
          fechaInscripcion: new Date(),
          estadoAcademico: EstadoAcademico.Activo,
        }
      });

      return { alumno, matricula };
    });
  }
};