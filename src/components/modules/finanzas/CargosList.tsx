'use client';

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
  if (cargos.length === 0) {
    return <p className="text-gray-500">No hay cargos registrados para este alumno.</p>;
  }

  return (
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
          {cargos.map((cargo) => (
            <tr key={cargo.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cargo.concepto.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cargo.fechaVencimiento).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">${cargo.monto.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600">${cargo.saldo.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <EstadoCargoBadge estado={cargo.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
