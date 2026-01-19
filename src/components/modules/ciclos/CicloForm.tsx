'use client';

import { createCiclo, updateCiclo } from '@/lib/actions/ciclo-actions';
import { CicloLectivo } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';

interface CicloFormProps {
  ciclo?: CicloLectivo;
}

export function CicloForm({ ciclo }: CicloFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!ciclo;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const data = {
      anio: Number(formData.get('anio')),
      estado: formData.get('estado') === 'on',
    };

    startTransition(async () => {
      const result = isEditMode
        ? await updateCiclo(ciclo.idCiclo, data)
        : await createCiclo(data);

      if (result.success) {
        router.push('/dashboard/ciclos');
      } else {
        setError(result.message || "Ocurrió un error.");
      }
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="anio" className="block text-gray-700 text-sm font-bold mb-2">
          Año del Ciclo Lectivo
        </label>
        <select
          id="anio"
          name="anio"
          required
          defaultValue={ciclo?.anio ?? currentYear}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <label className="flex items-center">
            <input
                type="checkbox"
                name="estado"
                defaultChecked={ciclo?.estado ?? true}
                className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Marcar como ciclo activo</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">Si marcas esta opción, cualquier otro ciclo que esté activo será desactivado.</p>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
            Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
        >
          {isPending ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Ciclo')}
        </button>
      </div>
    </form>
  );
}
