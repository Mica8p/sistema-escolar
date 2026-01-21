'use client';

import { useState, useTransition } from "react";
import { getDetalleCuenta, RegistrarPagoData } from "@/service/finanzas.service";
import { MetodoPago } from "@prisma/client";
import { registrarPagoAction } from "@/lib/actions/finanzas-actions";

type ModalProps = {
  alumno: Awaited<ReturnType<typeof getDetalleCuenta>>;
  isOpen: boolean;
  onClose: () => void;
};

export default function RegistrarPagoModal({ alumno, isOpen, onClose }: ModalProps) {
  const [isPending, startTransition] = useTransition();
  const [montoAPagar, setMontoAPagar] = useState<string | number>("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cargosPendientes = alumno.cargos.filter(c => c.saldo > 0);

  const handleRegisterPayment = async () => {
    const montoFinal = Number(montoAPagar);
    if (montoFinal <= 0) {
      setError("El monto a pagar debe ser mayor a cero.");
      return;
    }
    
    setError(null);

    let montoRestante = montoFinal;
    const cargosAPagar: { cargoId: number; monto: number }[] = [];

    // Lógica para distribuir el pago entre los cargos pendientes (estrategia simple: del más antiguo al más nuevo)
    for (const cargo of cargosPendientes) {
      if (montoRestante <= 0) break;
      const montoAplicado = Math.min(montoRestante, cargo.saldo);
      cargosAPagar.push({ cargoId: cargo.id, monto: montoAplicado });
      montoRestante -= montoAplicado;
    }

    if (cargosAPagar.length === 0) {
        setError("No hay cargos pendientes a los que aplicar el pago.");
        return;
    }

    const pagoData: Omit<RegistrarPagoData, 'usuarioId'> = {
        alumnoId: alumno.idAlumno,
        montoTotal: montoFinal,
        fechaPago: new Date(),
        metodoPago,
        referencia,
        cargosAPagar,
    };

    startTransition(async () => {
      try {
        await registrarPagoAction(pagoData);
        alert("Pago registrado con éxito!");
        onClose();
        // revalidatePath in the action should refresh the data for server components.
        // For a client component with state, a reload or manual refetch is needed.
        window.location.reload();
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Registrar Nuevo Pago</h2>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-900">Monto a Pagar</label>
                <input
                    type="number"
                    id="monto"
                    value={montoAPagar}
                    onChange={(e) => setMontoAPagar(e.target.value)}
                    placeholder="Ej: $1500"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="metodoPago" className="block text-sm font-medium text-gray-900">Método de Pago</label>
                <select
                    id="metodoPago"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    {Object.values(MetodoPago).map(metodo => (
                        <option key={metodo} value={metodo}>{metodo}</option>
                    ))}
                </select>
            </div>

             <div>
                <label htmlFor="referencia" className="block text-sm font-medium text-gray-900">Referencia (Opcional)</label>
                <input
                    type="text"
                    id="referencia"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Ej: Transferencia #123456"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleRegisterPayment}
            disabled={isPending}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? 'Registrando...' : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}
