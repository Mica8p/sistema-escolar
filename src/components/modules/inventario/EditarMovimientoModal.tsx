"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMovimientoStock } from "@/lib/actions/movimiento-stock-actions";
import { X } from "lucide-react";

type Movimiento = {
  idMovimiento: number;
  tipo: "Entrada" | "Salida" | "Ajuste";
  cantidad: number;
  fecha: string | Date;
  insumo: { nombre: string; unidadMedida: string };
  usuario: { persona: { nombre: string; apellido: string } };
  gastos: { monto: number; concepto: string; categoria: string }[];
};

export default function EditarMovimientoModal({
  open,
  onClose,
  movimiento,
}: {
  open: boolean;
  onClose: () => void;
  movimiento: Movimiento | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cantidad, setCantidad] = useState(() => String(movimiento?.cantidad ?? 0));
  const [monto, setMonto] = useState(() => String(movimiento?.gastos?.[0]?.monto ?? ""));
  const [concepto, setConcepto] = useState(() => movimiento?.gastos?.[0]?.concepto ?? "");
  const [categoria, setCategoria] = useState<"Insumos" | "Servicios" | "Mantenimiento" | "Sueldos">(() => (movimiento?.gastos?.[0]?.categoria as "Insumos" | "Servicios" | "Mantenimiento" | "Sueldos") ?? "Insumos");

  if (!open || !movimiento) return null;

  const onlyInt = (v: string) => (/^\d*$/.test(v) ? v : v.replace(/[^\d]/g, ""));
  const onlyNumeric = (v: string) => v.replace(/[^\d.]/g, "").replace(/(\..*?)\..*/g, "$1");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.set("idMovimiento", String(movimiento.idMovimiento));
    fd.set("cantidad", cantidad || "0");

    if (movimiento.tipo === "Entrada" && movimiento.gastos?.length) {
      fd.set("monto", monto || "0");
      fd.set("concepto", concepto);
      fd.set("categoria", categoria);
    }

    startTransition(async () => {
      const res = await updateMovimientoStock(fd);
      if (res.success) {
        router.refresh();
        onClose();
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />}

      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Editar Movimiento</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* Insumo (read-only) */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Insumo</label>
                <div className="rounded-lg bg-slate-50 p-2.5 text-sm text-gray-900">
                  {movimiento.insumo.nombre}
                </div>
              </div>

              {/* Tipo (read-only) */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <div className="rounded-lg bg-slate-50 p-2.5 text-sm text-gray-900">
                  {movimiento.tipo}
                </div>
              </div>

              {/* Cantidad */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Cantidad ({movimiento.insumo.unidadMedida})</label>
                <input
                  value={cantidad}
                  onChange={(e) => setCantidad(onlyInt(e.target.value))}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0"
                />
              </div>

              {/* Gasto Asociado */}
              {movimiento.tipo === "Entrada" && movimiento.gastos?.length > 0 && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium text-gray-700 mb-3">Gasto Asociado</h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Monto ($)</label>
                    <input
                      value={monto}
                      onChange={(e) => setMonto(onlyNumeric(e.target.value))}
                      inputMode="decimal"
                      className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Concepto</label>
                    <input
                      value={concepto}
                      onChange={(e) => setConcepto(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Ej: Compra de papelería"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Categoría</label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value as "Insumos" | "Servicios" | "Mantenimiento" | "Sueldos")}
                      className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="Insumos">Insumos</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Sueldos">Sueldos</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Botones */}
            <div className="mt-auto flex gap-2 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {pending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
