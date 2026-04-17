
import { EstadoCuota } from "@prisma/client";

type Cargo = {
  id: number;
  concepto: { nombre: string };
  fechaVencimiento: Date;
  monto: number;
  estado: EstadoCuota;
};

type AlumnoExtendido = {
  cargos: Cargo[];
};

export default function PaymentInfo({ alumno }: { alumno: AlumnoExtendido }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Estado de Cuenta</h2>

      {alumno.cargos.length > 0 ? (
        <ul className="space-y-3">
          {alumno.cargos.map((cargo) => (
            <li key={cargo.id} className="flex justify-between items-center p-3 rounded-md border border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">{cargo.concepto.nombre}</p>
                <p className="text-sm text-gray-500">Vence: {new Date(cargo.fechaVencimiento).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-800">${cargo.monto.toFixed(2)}</p>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  cargo.estado === 'Pagado' ? 'bg-green-100 text-green-700' :
                  cargo.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {cargo.estado}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No hay cargos registrados para este alumno.</p>
      )}
    </div>
  );
}
