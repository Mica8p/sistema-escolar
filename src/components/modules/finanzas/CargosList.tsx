'use client';

import { useState } from 'react';
import { getDetalleCuenta } from "@/service/finanzas.service";

type CargosListProps = {
  cargos: Awaited<ReturnType<typeof getDetalleCuenta>>["cargos"];
};

const EstadoCargoBadge = ({ estado }: { estado: string }) => {
  const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
  let specificClasses = "";

  switch (estado) {
    case "Pagado":
      specificClasses = "bg-green-100 text-green-800";
      break;
    case "Pendiente":
      specificClasses = "bg-yellow-100 text-yellow-800";
      break;
    case "Parcial":
      specificClasses = "bg-blue-100 text-blue-800";
      break;
    case "Vencido":
      specificClasses = "bg-red-100 text-red-800";
      break;
    default:
      specificClasses = "bg-gray-100 text-gray-800";
  }

  return <span className={`${baseClasses} ${specificClasses}`}>{estado}</span>;
};


export default function CargosList({ cargos }: CargosListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Ordenar cargos: no pagados primero, pagados al final
  const sortedCargos = [...cargos].sort((a, b) => {
    const order = { 'Pendiente': 1, 'Parcial': 2, 'Vencido': 3, 'Pagado': 4 };
    return order[a.estado] - order[b.estado];
  });

  const totalPages = Math.ceil(sortedCargos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCargos = sortedCargos.slice(startIndex, startIndex + itemsPerPage);

  if (cargos.length === 0) {
    return <p className="text-gray-500">No hay cargos registrados para este alumno.</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Vto.</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Pendiente</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCargos.map((cargo) => {
              // Determinar el estado dinámicamente basado en el saldo
              let estadoDinamico = cargo.estado;
              if (cargo.saldo === 0) {
                estadoDinamico = 'Pagado';
              } else if (cargo.saldo > 0 && cargo.saldo < cargo.monto) {
                estadoDinamico = 'Parcial';
              } else if (cargo.saldo === cargo.monto) {
                // Si el saldo es igual al monto, significa que no hay pagos
                estadoDinamico = cargo.estado; // Usa el estado original (Pendiente o Vencido)
              }
              
              return (
                <tr key={cargo.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cargo.concepto.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cargo.fechaVencimiento ? new Date(cargo.fechaVencimiento).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">${cargo.monto.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600">${cargo.saldo.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <EstadoCargoBadge estado={estadoDinamico} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
