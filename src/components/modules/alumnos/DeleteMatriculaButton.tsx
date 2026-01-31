"use client";

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteMatriculaAction } from '@/lib/actions/alumno-actions';

interface DeleteMatriculaButtonProps {
  idMatricula: number;
}

export default function DeleteMatriculaButton({ idMatricula }: DeleteMatriculaButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta inscripción? Esta acción no se puede deshacer.')) {
      startTransition(async () => {
        const result = await deleteMatriculaAction(idMatricula);
        if (!result.success) {
          alert(`Error: ${result.message}`);
        } else {
          // Opcional: mostrar un toast de éxito
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 text-xs font-bold disabled:text-gray-400 disabled:cursor-not-allowed"
      title="Eliminar inscripción"
    >
      {isPending ? 'Eliminando...' : 'Eliminar'}
    </button>
  );
}
