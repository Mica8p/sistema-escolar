'use client';

import { useState } from 'react';
import { ConceptoDePago } from "@prisma/client";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";

type ConceptosListProps = {
  conceptos: ConceptoDePago[];
  onEdit: (concepto: ConceptoDePago) => void;
};

export default function ConceptosList({ conceptos, onEdit }: ConceptosListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(conceptos.length / itemsPerPage);
  const paginatedConceptos = conceptos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-900">
          <tr>
            <th className="px-6 py-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Concepto</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Descripción</th>
            <th className="px-6 py-4 text-right text-[10px] font-black text-white uppercase tracking-widest">Monto</th>
            <th className="px-6 py-4 text-center text-[10px] font-black text-white uppercase tracking-widest">Vencimiento</th>
            <th className="px-6 py-4 text-center text-[10px] font-black text-white uppercase tracking-widest">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-50">
          {paginatedConceptos.map((concepto) => (
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600">
                {concepto.fechaVencimiento ? new Date(concepto.fechaVencimiento).toLocaleDateString() : '-'}
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4 p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="text-sm font-bold text-slate-500">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}