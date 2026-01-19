import db from '@/lib/db';
import { Curso } from '@prisma/client';

export const cursoService = {
  // 1. Agregamos ordenamiento para que la secretaria vea 1°, 2°, 3° en orden
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

  // 2. Aquí Prisma ya sabe que 'data' debe incluir turno y nivel obligatoriamente
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

  // 3. CAMBIO CLAVE: Usamos 'Partial' para poder editar solo el Turno o solo el Grado
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
      // 4. Mejoramos el mensaje de error por si el curso tiene alumnos matriculados
      console.error('Error al eliminar el curso:', error);
      throw new Error('No se puede eliminar un curso que ya tiene alumnos o materias asignadas.');
    }
  },
};