'use client';

import { useState } from "react";
import { getDetalleCuenta } from "@/service/finanzas.service";
import ComprobantePago from "./ComprobantePago";

type PagosListProps = {
  pagos: Awaited<ReturnType<typeof getDetalleCuenta>>["pagos"];
  alumnoData: {
    nombre: string;
    legajo: string;
    curso: string;
  };
};

export default function PagosList({ pagos, alumnoData }: PagosListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (pagos.length === 0) {
    return <p className="text-gray-500 py-4 italic text-sm">No hay pagos registrados para este alumno.</p>;
  }

  const totalPages = Math.ceil(pagos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPagos = pagos.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
              <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
              <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Método</th>
              <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Referencia</th>
              <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalle Aplicado</th>
              <th scope="col" className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedPagos.map((pago) => {
              const conceptoUnificado = pago.detalles
                .map(d => d.cargo.concepto.nombre)
                .join(", ");

              return (
                <tr key={pago.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pago.fechaPago).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                    ${pago.montoTotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500 uppercase">
                    {pago.metodoPago}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-medium">
                    {pago.referencia || '-'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <ul className="space-y-1">
                      {pago.detalles.map(detalle => (
                        <li key={detalle.id} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                          <span className="font-bold text-slate-700">${detalle.monto.toFixed(2)}</span>
                          <span className="text-slate-400 lowercase">en {detalle.cargo.concepto.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <ComprobantePago
                      pago={{
                        idPago: String(pago.id),
                        monto: pago.montoTotal,
                        fecha: new Date(pago.fechaPago).toLocaleDateString(),
                        metodo: pago.metodoPago,
                        concepto: conceptoUnificado || "Pago General"
                      }}
                      alumno={{
                        nombre: alumnoData?.nombre || "Cargando...",
                        legajo: alumnoData?.legajo || "S/L",
                        curso: alumnoData?.curso || "N/A"
                      }}
                    />
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
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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