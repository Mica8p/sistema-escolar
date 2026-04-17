'use client';

import { useState, useTransition } from "react";
import { getDetalleCuenta, RegistrarPagoData } from "@/service/finanzas.service";
import { MetodoPago } from "@prisma/client";
import { registrarPagoAction } from "@/lib/actions/finanzas-actions";
import { toast } from "sonner";
import  ConfirmModal  from "@/components/shared/ConfirmModal";

type ModalProps = {
  alumno: Awaited<ReturnType<typeof getDetalleCuenta>>;
  isOpen: boolean;
  onClose: () => void;
};

export default function RegistrarPagoModal({ alumno, isOpen, onClose }: ModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedCargoId, setSelectedCargoId] = useState<number | null>(null);
  const [montoAPagar, setMontoAPagar] = useState<string | number>("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const cargosPendientes = alumno.cargos.filter(c => c.saldo > 0);

  // 1. Validación previa antes de mostrar el segundo modal
  const handlePreSubmit = () => {
    if (!selectedCargoId) {
      toast.error("Debe seleccionar un concepto de deuda para pagar.");
      return;
    }
    const montoFinal = Number(montoAPagar);
    if (montoFinal <= 0) {
      toast.error("El monto a pagar debe ser mayor a cero.");
      return;
    }
    const cargoPendiente = cargosPendientes.find(c => c.id === selectedCargoId);
    if (!cargoPendiente) {
      toast.error("El cargo seleccionado no existe.");
      return;
    }
    if (montoFinal > cargoPendiente.saldo) {
      toast.error(`El monto no puede ser mayor al saldo pendiente de $${cargoPendiente.saldo}`);
      return;
    }
    // Abrimos el modal de confirmación
    setIsConfirmOpen(true);
  };

  // 2. Ejecución real de la transacción
  const handleRegisterPayment = () => {
    const montoFinal = Number(montoAPagar);
    const cargosAPagar: { cargoId: number; monto: number }[] = [
      { cargoId: selectedCargoId!, monto: montoFinal }
    ];

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
        toast.success("¡Pago registrado con éxito!");
        setIsConfirmOpen(false);
        setSelectedCargoId(null);
        setMontoAPagar("");
        onClose();
        // El sistema revalida la ruta automáticamente desde la acción del servidor
      } catch (e) {
        toast.error((e as Error).message || "Error al registrar el pago");
        setIsConfirmOpen(false);
      }
    });
  };

  const selectedCargo = cargosPendientes.find(c => c.id === selectedCargoId);

  if (!isOpen) return null;

  return (
    <>
      {/* MODAL PRINCIPAL (Tu estética original) */}
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Registrar Nuevo Pago</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="concepto" className="block text-sm font-medium text-gray-900">Concepto de Deuda</label>
              <select
                id="concepto"
                value={selectedCargoId || ""}
                onChange={(e) => {
                  setSelectedCargoId(e.target.value ? Number(e.target.value) : null);
                  setMontoAPagar("");
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm"
              >
                <option value="">-- Seleccione un concepto --</option>
                {cargosPendientes.map(cargo => (
                  <option key={cargo.id} value={cargo.id}>
                    {typeof cargo.concepto === 'string' ? cargo.concepto : cargo.concepto?.nombre} - Saldo: ${cargo.saldo}
                  </option>
                ))}
              </select>
              {cargosPendientes.length === 0 && (
                <p className="text-xs text-green-600 mt-2">No hay deudas pendientes</p>
              )}
            </div>

            {selectedCargo && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-gray-700"><strong>Concepto:</strong> {typeof selectedCargo.concepto === 'string' ? selectedCargo.concepto : selectedCargo.concepto?.nombre}</p>
                <p className="text-sm text-gray-700"><strong>Saldo pendiente:</strong> ${selectedCargo.saldo}</p>
                <p className="text-sm text-gray-700"><strong>Fecha vencimiento:</strong> {new Date(selectedCargo.fechaVencimiento).toLocaleDateString()}</p>
              </div>
            )}

            <div>
              <label htmlFor="monto" className="block text-sm font-medium text-gray-900">Monto a Pagar</label>
              <input
                type="number"
                id="monto"
                value={montoAPagar}
                onChange={(e) => setMontoAPagar(e.target.value)}
                placeholder="Ej: 3000"
                max={selectedCargo?.saldo}
                disabled={!selectedCargo}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="metodoPago" className="block text-sm font-medium text-gray-900">Método de Pago</label>
              <select
                id="metodoPago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm"
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
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handlePreSubmit}
              disabled={isPending || !selectedCargo}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN (z-index superior para que sea visible) */}
      <div className="relative z-60">
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleRegisterPayment}
          title="Validar Transacción"
          message={`¿Confirmas el pago de $${montoAPagar} para "${typeof selectedCargo?.concepto === 'string' ? selectedCargo?.concepto : selectedCargo?.concepto?.nombre}" vía ${metodoPago}?`}
          loading={isPending}
          variant="info"
        />
      </div>
    </>
  );
}