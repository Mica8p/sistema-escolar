"use client";

import { useState, useTransition } from "react";
import { createMovimientoStock } from "@/lib/actions/movimiento-stock-actions";

type Insumo = {
  idInsumo: number;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
};

export default function MovimientoStockModal({
  open,
  onClose,
  insumo,
  tipoInicial = "Salida",
}: {
  open: boolean;
  onClose: () => void;
  insumo: Insumo | null;
  tipoInicial?: "Entrada" | "Salida" | "Ajuste";
}) {
  const [pending, startTransition] = useTransition();
  const [cantidad, setCantidad] = useState(() => "1");
  const [ajusteSign, setAjusteSign] = useState<"sumar" | "restar">(() => "sumar");
  const [error, setError] = useState<string | null>(null);

  const [monto, setMonto] = useState(() => "");
  const [concepto, setConcepto] = useState(() => "");
  const [categoria, setCategoria] = useState<"Insumos" | "Servicios" | "Mantenimiento" | "Sueldos">(() => "Insumos");

  if (!open || !insumo) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const onlyInt = (v: string) => (/^\d*$/.test(v) ? v : v.replace(/[^\d]/g, ""));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.set("idInsumo", String(insumo.idInsumo));
    fd.set("tipo", tipoInicial);
    fd.set("cantidad", cantidad || "0");

    if (tipoInicial === "Ajuste") fd.set("ajusteSign", ajusteSign);

    if (tipoInicial === "Entrada") {
      fd.set("crearGasto", "1");
      fd.set("monto", monto || "0");
      fd.set("concepto", concepto);
      fd.set("categoria", categoria);
    }

    startTransition(async () => {
      const res = await createMovimientoStock(fd);
      if (!res.success) {
        setError(res.message);
        return;
      }
      setError(null);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div key={`${tipoInicial}-${insumo?.idInsumo}`} className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Movimiento de stock</h2>
          <p className="text-sm text-gray-600">
            {insumo.nombre} • Stock actual: <b className="text-gray-900">{insumo.stockActual}</b> {insumo.unidadMedida}
          </p>
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 px-5 py-4">


          {tipoInicial === "Ajuste" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAjusteSign("sumar")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  ajusteSign === "sumar" ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-gray-700"
                }`}
              >
                Sumar
              </button>
              <button
                type="button"
                onClick={() => setAjusteSign("restar")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  ajusteSign === "restar" ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-gray-700"
                }`}
              >
                Restar
              </button>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Cantidad</label>
            <input
              value={cantidad}
              onChange={(e) => setCantidad(onlyInt(e.target.value))}
              inputMode="numeric"
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="0"
            />
          </div>

          {tipoInicial === "Entrada" && (
            <div className="space-y-3 rounded-xl border bg-slate-50 p-3">
              <p className="font-bold text-sm text-gray-700">Registrar gasto por esta compra</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Monto</label>
                    <input
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      inputMode="decimal"
                      required
                      className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Ej: 15000"
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
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Concepto</label>
                  <input
                    value={concepto}
                    onChange={(e) => setConcepto(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Ej: Compra de insumos librería"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50 text-gray-700"
              disabled={pending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={pending}
            >
              {pending ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
