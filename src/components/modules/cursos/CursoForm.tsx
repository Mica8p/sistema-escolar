'use client';

import { createCurso, updateCurso } from '@/lib/actions/curso-actions';
import { Curso, Nivel, Turno } from '@prisma/client'; // 1. Agregamos Turno a la importación
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface CursoFormProps {
  curso?: Curso;
}

export function CursoForm({ curso }: CursoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!curso;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // 2. Capturamos el Turno del formData para que TypeScript no de error
    const data = {
      grado: formData.get('grado') as string,
      seccion: formData.get('seccion') as string,
      nivel: formData.get('nivel') as Nivel,
      turno: formData.get('turno') as Turno, // <-- ESTA LÍNEA FALTABA
    };

    startTransition(async () => {
      const result = isEditMode
        ? await updateCurso(curso.idCurso, data)
        : await createCurso(data);

      if (result.success) {
        router.push('/dashboard/cursos');
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
        {isEditMode ? 'Editar Curso' : 'Crear Nuevo Curso'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grado */}
        <div className="mb-4">
          <label htmlFor="grado" className="block text-gray-700 text-sm font-bold mb-2">
            Grado
          </label>
          <input
            type="text"
            id="grado"
            name="grado"
            required
            placeholder="Ej: 1er Año"
            defaultValue={curso?.grado}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sección */}
        <div className="mb-4">
          <label htmlFor="seccion" className="block text-gray-700 text-sm font-bold mb-2">
            Sección
          </label>
          <input
            type="text"
            id="seccion"
            name="seccion"
            required
            placeholder="Ej: A"
            defaultValue={curso?.seccion}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Nivel */}
        <div className="mb-4">
          <label htmlFor="nivel" className="block text-gray-700 text-sm font-bold mb-2">
            Nivel
          </label>
          <select
            id="nivel"
            name="nivel"
            required
            defaultValue={curso?.nivel}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Seleccionar nivel...</option>
            <option value="Primario">Primario</option>
            <option value="Secundario">Secundario</option>
          </select>
        </div>

        {/* Turno - ACTUALIZADO */}
        <div className="mb-4">
          <label htmlFor="turno" className="block text-gray-700 text-sm font-bold mb-2">
            Turno
          </label>
          <select
            id="turno"
            name="turno"
            required
            defaultValue={curso?.turno || ""} // 3. Permitimos que cargue el turno si estamos editando
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Seleccionar turno....</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded shadow transition-colors disabled:bg-gray-400"
        >
          {isPending ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Curso')}
        </button>
      </div>
    </form>
  );
}
