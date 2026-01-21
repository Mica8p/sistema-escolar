'use client';

import { ConceptoDePago } from "@prisma/client";
import { deleteConceptoAction } from "@/lib/actions/finanzas-actions";
import { Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";

type ConceptosListProps = {
  conceptos: ConceptoDePago[];
  onEdit: (concepto: ConceptoDePago) => void;
};

export default function ConceptosList({ conceptos, onEdit }: ConceptosListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este concepto de pago?")) {
      startTransition(async () => {
        try {
          await deleteConceptoAction(id);
        } catch (error: any) {
          alert(`Error al eliminar: ${error.message}`);
        }
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Fijo</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {conceptos.map((concepto) => (
            <tr key={concepto.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{concepto.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{concepto.descripcion}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                {concepto.montoFijo ? `$${concepto.montoFijo.toFixed(2)}` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onClick={() => onEdit(concepto)} className="text-indigo-600 hover:text-indigo-900">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(concepto.id)} className="text-red-600 hover:text-red-900" disabled={isPending}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
