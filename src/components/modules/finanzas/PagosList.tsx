'use client';

import { getDetalleCuenta } from "@/service/finanzas.service";

type PagosListProps = {
  pagos: Awaited<ReturnType<typeof getDetalleCuenta>>["pagos"];
};

export default function PagosList({ pagos }: PagosListProps) {
  if (pagos.length === 0) {
    return <p className="text-gray-500">No hay pagos registrados para este alumno.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Pago</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total Pagado</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle Aplicado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pagos.map((pago) => (
            <tr key={pago.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(pago.fechaPago).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${pago.montoTotal.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pago.metodoPago}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pago.referencia || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <ul className="list-disc list-inside">
                    {pago.detalles.map(detalle => (
                        <li key={detalle.id}>
                            ${detalle.monto.toFixed(2)} en "{detalle.cargo.concepto.nombre}"
                        </li>
                    ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
