'use client';

import { createCurso, updateCurso } from '@/lib/actions/curso-actions';
import { Curso, Nivel } from '@prisma/client';
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
    const data = {
      grado: formData.get('grado') as string,
      seccion: formData.get('seccion') as string,
      nivel: formData.get('nivel') as Nivel,
    };

    startTransition(async () => {
      const result = isEditMode
        ? await updateCurso(curso.idCurso, data)
        : await createCurso(data);

      if (result.success) {
        router.push('/dashboard/cursos');
      } else {
        // Aquí podrías mostrar un mensaje de error al usuario
        alert(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="grado" className="block text-gray-700 text-sm font-bold mb-2">
          Grado (Ej: 1er Año, 2do Grado)
        </label>
        <input
          type="text"
          id="grado"
          name="grado"
          required
          defaultValue={curso?.grado}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="seccion" className="block text-gray-700 text-sm font-bold mb-2">
          Sección (Ej: A, B, Única)
        </label>
        <input
          type="text"
          id="seccion"
          name="seccion"
          required
          defaultValue={curso?.seccion}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="nivel" className="block text-gray-700 text-sm font-bold mb-2">
          Nivel
        </label>
        <select
          id="nivel"
          name="nivel"
          required
          defaultValue={curso?.nivel}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="Primario">Primario</option>
          <option value="Secundario">Secundario</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
        >
          {isPending ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Guardar Curso')}
        </button>
        <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
            Cancelar
        </button>
      </div>
    </form>
  );
}
