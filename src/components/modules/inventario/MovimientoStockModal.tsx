"use client";

import { useEffect, useState, useTransition } from "react";
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
  canEntrada,
  canSalida,
  canAjuste,
}: {
  open: boolean;
  onClose: () => void;
  insumo: Insumo | null;
  tipoInicial?: "Entrada" | "Salida" | "Ajuste";
  canEntrada: boolean;
  canSalida: boolean;
  canAjuste: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<"Entrada" | "Salida" | "Ajuste">(tipoInicial);
  const [cantidad, setCantidad] = useState("1");
  const [ajusteSign, setAjusteSign] = useState<"sumar" | "restar">("sumar");

  const [crearGasto, setCrearGasto] = useState(false);
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [categoria, setCategoria] = useState<"Insumos" | "Servicios" | "Mantenimiento" | "Sueldos">("Insumos");


  useEffect(() => {
    setTipo(tipoInicial);
    setCantidad("1");
    setAjusteSign("sumar");
    setCrearGasto(false);
    setMonto("");
    setConcepto("");
    setCategoria("Insumos");

  }, [tipoInicial, open]);

  if (!open || !insumo) return null;

  const onlyInt = (v: string) => (/^\d*$/.test(v) ? v : v.replace(/[^\d]/g, ""));

  const allowedTipos = [
    canEntrada ? "Entrada" : null,
    canSalida ? "Salida" : null,
    canAjuste ? "Ajuste" : null,
  ].filter(Boolean) as Array<"Entrada" | "Salida" | "Ajuste">;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.set("idInsumo", String(insumo.idInsumo));
    fd.set("tipo", tipo);
    fd.set("cantidad", cantidad || "0");
    if (tipo === "Ajuste") fd.set("ajusteSign", ajusteSign);
    if (tipo === "Entrada" && crearGasto) {
    fd.set("crearGasto", "1");
    fd.set("monto", monto || "0");
    fd.set("concepto", concepto);
    fd.set("categoria", categoria);
}

    startTransition(async () => {
      const res = await createMovimientoStock(fd);
      if (!res.success) {
        alert(res.message); // después lo reemplazás por toast cuando tu equipo decida
        return;
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Movimiento de stock</h2>
          <p className="text-sm text-slate-600">
            {insumo.nombre} • Stock actual: <b>{insumo.stockActual}</b> {insumo.unidadMedida}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-5 py-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allowedTipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {tipo === "Ajuste" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAjusteSign("sumar")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  ajusteSign === "sumar" ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                }`}
              >
                Sumar
              </button>
              <button
                type="button"
                onClick={() => setAjusteSign("restar")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  ajusteSign === "restar" ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                }`}
              >
                Restar
              </button>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Cantidad</label>
            <input
              value={cantidad}
              onChange={(e) => setCantidad(onlyInt(e.target.value))}
              inputMode="numeric"
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {tipo === "Entrada" && (
  <div className="space-y-3 rounded-xl border bg-slate-50 p-3">
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={crearGasto}
        onChange={(e) => setCrearGasto(e.target.checked)}
      />
      Registrar gasto por esta compra
    </label>

    {crearGasto && (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Monto</label>
            <input
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 15000"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Insumos">Insumos</option>
              <option value="Servicios">Servicios</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Sueldos">Sueldos</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Concepto</label>
          <input
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Compra de insumos librería"
          />
        </div>
      </div>
    )}
  </div>
)}


          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
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
