"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState } from "react";
import { createDeuda, type State } from "@/app/(dashboard)/dashboard/finanzas/finanzas-actions";
import { toast } from "sonner";

interface ConceptoDePago {
  id: number;
  nombre: string;
  montoFijo: number | null;
}

interface CrearDeudaDialogProps {
  alumnoId: number;
  conceptos: ConceptoDePago[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2"
    >
      {pending ? "Creando Deuda..." : "Crear Deuda"}
    </button>
  );
}

export function CrearDeudaDialog({ alumnoId, conceptos }: CrearDeudaDialogProps) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createDeuda, initialState);

  const [open, setOpen] = useState(false);
  const [selectedConceptoId, setSelectedConceptoId] = useState<string>("");
  const [monto, setMonto] = useState<string>("");

  useEffect(() => {
    const selectedConcepto = conceptos.find(c => c.id === Number(selectedConceptoId));
    if (selectedConcepto && selectedConcepto.montoFijo) {
      setMonto(String(selectedConcepto.montoFijo));
    } else {
      setMonto("");
    }
  }, [selectedConceptoId, conceptos]);

  useEffect(() => {
    if (state.message && !state.errors) {
      setOpen(false);
      toast.success(state.message);
    } else if (state.message && state.errors) {
      toast.error(state.message)
    }
  }, [state]);


  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2 ml-2"
      >
        Crear Deuda
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight">Crear Nueva Deuda</h2>
              <p className="text-sm text-gray-500">
                Asigna un nuevo cargo o deuda al alumno. Selecciona un concepto y define los detalles.
              </p>
            </div>

            <form action={dispatch} className="mt-4">
              <input type="hidden" name="alumnoId" value={alumnoId} />
              <div className="grid gap-4 py-4">

                {/* Selector de Concepto */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="conceptoId" className="text-right text-sm font-medium text-gray-900">Concepto</label>
                  <div className="col-span-3">
                    <select
                      name="conceptoId"
                      value={selectedConceptoId}
                      onChange={(e) => setSelectedConceptoId(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Seleccione un concepto</option>
                      {conceptos.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                      ))}
                    </select>
                    {state.errors?.conceptoId && <p className="text-sm text-red-500 mt-1">{state.errors.conceptoId[0]}</p>}
                  </div>
                </div>

                {/* Campo de Monto */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="monto" className="text-right text-sm font-medium text-gray-900">Monto</label>
                  <div className="col-span-3">
                    <input
                      id="monto"
                      name="monto"
                      type="number"
                      step="0.01"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="Ej: 1500.00"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {state.errors?.monto && <p className="text-sm text-red-500 mt-1">{state.errors.monto[0]}</p>}
                  </div>
                </div>

                {/* Campo de Fecha de Vencimiento */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="fechaVencimiento" className="text-right text-sm font-medium text-gray-900">Vencimiento</label>
                  <div className="col-span-3">
                    <input
                      id="fechaVencimiento"
                      name="fechaVencimiento"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {state.errors?.fechaVencimiento && <p className="text-sm text-red-500 mt-1">{state.errors.fechaVencimiento[0]}</p>}
                  </div>
                </div>

              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-10 px-4 py-2"
                >
                  Cancelar
                </button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}