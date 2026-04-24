import db from '@/lib/db';
import { Curso, Turno } from '@prisma/client';

export async function getCursos() {
  try {
    return await db.curso.findMany({
      orderBy: [
        { grado: 'asc' },
        { seccion: 'asc' }
      ]
    });
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    throw new Error('No se pudieron obtener los cursos.');
  }
}

export function getTurnos() {
  return Object.values(Turno);
}

export const cursoService = {
  getAll: async () => {
    try {
      return await db.curso.findMany({
        orderBy: [
          { grado: 'asc' },
          { seccion: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Error al obtener los cursos:', error);
      throw new Error('No se pudieron obtener los cursos.');
    }
  },

  getById: async (id: number) => {
    try {
      return await db.curso.findUnique({
        where: { idCurso: id },
      });
    } catch (error) {
      console.error(`Error al obtener el curso con id ${id}:`, error);
      throw new Error('No se pudo encontrar el curso solicitado.');
    }
  },

  create: async (data: Omit<Curso, 'idCurso'>) => {
    try {
      return await db.curso.create({
        data,
      });
    } catch (error) {
      console.error('Error al crear el curso:', error);
      throw new Error('Error de base de datos al crear el curso.');
    }
  },

  update: async (id: number, data: Partial<Omit<Curso, 'idCurso'>>) => {
    try {
      return await db.curso.update({
        where: { idCurso: id },
        data,
      });
    } catch (error) {
      console.error(`Error al actualizar el curso con id ${id}:`, error);
      throw new Error('No se pudo actualizar la información del curso.');
    }
  },

  delete: async (id: number) => {
    try {
      // Verificar si el curso tiene asignaciones académicas activas
      const asignaciones = await db.asignacionAcademica.findMany({
        where: { idCurso: id },
      });

      if (asignaciones.length > 0) {
        throw new Error('No se puede eliminar este curso porque tiene materias asignadas. Elimine primero las asignaciones académicas.');
      }

      // Verificar si el curso tiene matrículas activas
      const matriculas = await db.matricula.findMany({
        where: { idCurso: id },
      });

      if (matriculas.length > 0) {
        throw new Error('No se puede eliminar este curso porque tiene alumnos matriculados. Elimine primero las matrículas.');
      }

      // Verificar si el curso tiene comunicados asociados
      const comunicados = await db.comunicado.findMany({
        where: { idTarget: id },
      });

      if (comunicados.length > 0) {
        throw new Error('No se puede eliminar este curso porque tiene comunicados asociados. Elimine primero los comunicados.');
      }

      return await db.curso.delete({
        where: { idCurso: id },
      });
    } catch (error) {
      console.error('Error al eliminar el curso:', error);
      const message = error instanceof Error ? error.message : 'No se puede eliminar el curso.';
      throw new Error(message);
    }
  },
};

export async function getCursosParaComunicado(rol: string, idProfesor?: number | null) {
  if (rol === "ADMIN") {
    return await db.curso.findMany({
      orderBy: [{ grado: 'asc' }, { seccion: 'asc' }]
    });
  }

  if (rol === "DOCENTE" && idProfesor) {
    const asignaciones = await db.asignacionAcademica.findMany({
      where: { idProfesor },
      select: { curso: true }
    });

    const cursosUnicos = Array.from(new Map(asignaciones.map(a => [a.curso.idCurso, a.curso])).values());
    return cursosUnicos;
  }

  return [];
}