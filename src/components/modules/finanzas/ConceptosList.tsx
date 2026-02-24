'use client';

import { ConceptoDePago } from "@prisma/client";
import { deleteConceptoAction } from "@/lib/actions/finanzas-actions";
import { Pencil } from "lucide-react";
import GenericDeleteButton from "@/components/shared/GenericDeletButton";

type ConceptosListProps = {
  conceptos: ConceptoDePago[];
  onEdit: (concepto: ConceptoDePago) => void;
};

export default function ConceptosList({ conceptos, onEdit }: ConceptosListProps) {
  return (
    <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-900">
          <tr>
            <th className="px-6 py-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Concepto</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Descripción</th>
            <th className="px-6 py-4 text-right text-[10px] font-black text-white uppercase tracking-widest">Monto</th>
            <th className="px-6 py-4 text-center text-[10px] font-black text-white uppercase tracking-widest">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-50">
          {conceptos.map((concepto) => (
            <tr key={concepto.id} className="hover:bg-indigo-50/30 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 uppercase">
                {concepto.nombre}
              </td>
              <td className="px-6 py-4 text-xs text-slate-400 font-medium italic">
                {concepto.descripcion || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-indigo-600">
                ${concepto.montoFijo?.toLocaleString() || '0'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(concepto)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                    title="Editar concepto"
                  >
                    <Pencil size={16} />
                  </button>
                  <GenericDeleteButton
                    id={concepto.id}
                    action={deleteConceptoAction}
                    title="Eliminar Concepto"
                    message={`¿Estás seguro de eliminar "${concepto.nombre}"?`}
                    variant="danger"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}