'use client';

import { getDetalleCuenta } from "@/service/finanzas.service";

type SummaryProps = {
  alumno: Awaited<ReturnType<typeof getDetalleCuenta>>;
};

export default function EstadoCuentaSummary({ alumno }: SummaryProps) {
  const deudaTotal = alumno.cargos.reduce((acc, cargo) => acc + cargo.saldo, 0);
  const cursoActual = alumno.matriculas[0]?.curso
    ? `${alumno.matriculas[0].curso.grado} '${alumno.matriculas[0].curso.seccion}'`
    : 'Sin curso asignado';

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-4 text-gray-900">Resumen de Cuenta</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Alumno</p>
          <p className="font-semibold text-lg text-gray-900">{alumno.persona.apellido}, {alumno.persona.nombre}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Curso Actual</p>
          <p className="font-semibold text-lg text-gray-900">{cursoActual}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Deuda Total</p>
          <p className={`font-bold text-2xl ${deudaTotal > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${deudaTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
