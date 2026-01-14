'use client';

import { createMateria, updateMateria } from '@/lib/actions/materia-actions';
import { Materia } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface MateriaFormProps {
  materia?: Materia;
}

export function MateriaForm({ materia }: MateriaFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!materia;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string,
    };

    startTransition(async () => {
      const result = isEditMode
        ? await updateMateria(materia.idMateria, data)
        : await createMateria(data);

      if (result.success) {
        router.push('/dashboard/materias');
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
          Nombre de la Materia (Ej: Matemática, Historia)
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          defaultValue={materia?.nombre}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">
          Descripción (Opcional)
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          defaultValue={materia?.descripcion || ''}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
        >
          {isPending ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Guardar Materia')}
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
