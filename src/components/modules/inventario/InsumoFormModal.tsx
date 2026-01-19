"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createInsumo, updateInsumo } from "@/lib/actions/inventario-actions";

type Insumo = {
  idInsumo: number;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
};

export default function InsumoFormModal({
  open,
  onClose,
  mode,
  insumo,
}: {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  insumo?: Insumo | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const title = mode === "create" ? "Nuevo insumo" : "Editar insumo";

  const initial = useMemo(() => {
    if (mode === "edit" && insumo) return insumo;
    return { idInsumo: 0, nombre: "", unidadMedida: "unidades", stockActual: 0, stockMinimo: 0 };
  }, [mode, insumo]);

  const [nombre, setNombre] = useState(initial.nombre);
  const [unidadMedida, setUnidadMedida] = useState(initial.unidadMedida);
  const [stockActual, setStockActual] = useState(String(initial.stockActual));
  const [stockMinimo, setStockMinimo] = useState(String(initial.stockMinimo));

  useEffect(() => {
    setNombre(initial.nombre);
    setUnidadMedida(initial.unidadMedida);
    setStockActual(String(initial.stockActual));
    setStockMinimo(String(initial.stockMinimo));
    setError(null);
    setOk(null);
  }, [initial, open]);

  if (!open) return null;

  function onlyInt(v: string) {
    return /^\d*$/.test(v) ? v : v.replace(/[^\d]/g, "");
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    const fd = new FormData();
    if (mode === "edit") fd.set("idInsumo", String(initial.idInsumo));
    fd.set("nombre", nombre.trim());
    fd.set("unidadMedida", unidadMedida.trim());
    fd.set("stockMinimo", stockMinimo || "0");
    if (mode === "create") fd.set("stockActual", stockActual || "0");

    startTransition(async () => {
      const res = mode === "create" ? await createInsumo(fd) : await updateInsumo(fd);
      if (!res.success) {
        setError(res.message);
        return;
      }
      setOk(res.message);
      // cerramos con una mini demora para que el usuario vea el ok (opcional)
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          <p className="text-sm text-slate-600">
            {mode === "create"
              ? "Cargá el insumo con stock inicial."
              : "Editá los datos generales (el stock se ajusta por movimientos)."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-5 py-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {ok && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{ok}</div>}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              placeholder="Ej: Resmas A4"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Unidad de medida</label>
            <input
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              placeholder="Ej: unidades / cajas / litros"
              required
            />
          </div>

          {mode === "create" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Stock inicial</label>
                <input
                  value={stockActual}
                  onChange={(e) => setStockActual(onlyInt(e.target.value))}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Stock mínimo</label>
                <input
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(onlyInt(e.target.value))}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Stock mínimo</label>
              <input
                value={stockMinimo}
                onChange={(e) => setStockMinimo(onlyInt(e.target.value))}
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm  text-red-600 hover:bg-slate-50 disabled:opacity-60"
              disabled={pending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={pending}
            >
              {pending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
