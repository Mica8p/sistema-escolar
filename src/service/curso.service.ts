import db from '@/lib/db';
import { Curso } from '@prisma/client';

export const cursoService = {
  getAll: async () => {
    try {
      return await db.curso.findMany();
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
      throw new Error('No se pudo obtener el curso.');
    }
  },

  create: async (data: Omit<Curso, 'idCurso'>) => {
    try {
      return await db.curso.create({
        data,
      });
    } catch (error) {
      console.error('Error al crear el curso:', error);
      throw new Error('No se pudo crear el curso.');
    }
  },

  update: async (id: number, data: Omit<Curso, 'idCurso'>) => {
    try {
      return await db.curso.update({
        where: { idCurso: id },
        data,
      });
    } catch (error) {
      console.error(`Error al actualizar el curso con id ${id}:`, error);
      throw new Error('No se pudo actualizar el curso.');
    }
  },

  delete: async (id: number) => {
    try {
      return await db.curso.delete({
        where: { idCurso: id },
      });
    } catch (error) {
      console.error('Error al eliminar el curso:', error);
      throw new Error('No se pudo eliminar el curso.');
    }
  },
};
