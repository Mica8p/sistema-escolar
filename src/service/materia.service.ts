import db from '@/lib/db';
import { Materia } from '@prisma/client';

export const materiaService = {
  getAll: async () => {
    try {
      return await db.materia.findMany();
    } catch (error) {
      console.error('Error al obtener las materias:', error);
      throw new Error('No se pudieron obtener las materias.');
    }
  },

  getById: async (id: number) => {
    try {
      return await db.materia.findUnique({
        where: { idMateria: id },
      });
    } catch (error) {
      console.error(`Error al obtener la materia con id ${id}:`, error);
      throw new Error('No se pudo obtener la materia.');
    }
  },

  create: async (data: Omit<Materia, 'idMateria'>) => {
    try {
      return await db.materia.create({
        data,
      });
    } catch (error) {
      console.error('Error al crear la materia:', error);
      throw new Error('No se pudo crear la materia.');
    }
  },

  update: async (id: number, data: Omit<Materia, 'idMateria'>) => {
    try {
      return await db.materia.update({
        where: { idMateria: id },
        data,
      });
    } catch (error) {
      console.error(`Error al actualizar la materia con id ${id}:`, error);
      throw new Error('No se pudo actualizar la materia.');
    }
  },

  delete: async (id: number) => {
    try {
      // Verificar si la materia está asignada a cursos (AsignacionAcademica)
      const asignaciones = await db.asignacionAcademica.findMany({
        where: { idMateria: id },
      });

      if (asignaciones.length > 0) {
        throw new Error('No se puede eliminar esta materia porque está asignada a uno o más cursos. Desasigne primero las clases que usan esta materia.');
      }

      return await db.materia.delete({
        where: { idMateria: id },
      });
    } catch (error) {
      console.error('Error al eliminar la materia:', error);
      const message = error instanceof Error ? error.message : 'No se pudo eliminar la materia.';
      throw new Error(message);
    }
  },
};
