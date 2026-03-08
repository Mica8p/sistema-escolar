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
      return await db.curso.delete({
        where: { idCurso: id },
      });
    } catch (error) {
      console.error('Error al eliminar el curso:', error);
      throw new Error('No se puede eliminar un curso que ya tiene alumnos o materias asignadas.');
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