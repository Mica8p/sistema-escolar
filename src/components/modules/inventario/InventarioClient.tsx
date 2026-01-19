"use client";

import { useMemo, useState } from "react";
import InsumoFormModal from "./InsumoFormModal";
import MovimientoStockModal from "./MovimientoStockModal";

type Insumo = {
  idInsumo: number;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
};

type Movimiento = {
  idMovimiento: number;
  tipo: "Entrada" | "Salida" | "Ajuste";
  cantidad: number;
  fecha: string | Date;
  insumo: { nombre: string; unidadMedida: string };
  usuario: { persona: { nombre: string; apellido: string } };
  gastos: { monto: number; concepto: string; categoria: string }[];
};

export default function InventarioClient({
  insumos,
  movimientos,
}: {
  insumos: Insumo[];
  movimientos: Movimiento[];
}) {
  /* ---------- Insumos (alta / edición) ---------- */
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Insumo | null>(null);

  /* ---------- Movimientos de stock ---------- */
  const [movOpen, setMovOpen] = useState(false);
  const [movInsumo, setMovInsumo] = useState<Insumo | null>(null);
  const [movTipo, setMovTipo] = useState<"Entrada" | "Salida" | "Ajuste">("Salida");

  const openMovimiento = (i: Insumo, tipo: "Entrada" | "Salida" | "Ajuste") => {
    setMovInsumo(i);
    setMovTipo(tipo);
    setMovOpen(true);
  };

  const onNew = () => {
    setSelected(null);
    setMode("create");
    setOpen(true);
  };

  const onEdit = (i: Insumo) => {
    setSelected(i);
    setMode("edit");
    setOpen(true);
  };

  const rows = useMemo(() => insumos, [insumos]);

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Inventario</h1>
          <p className="text-slate-600">Listado de insumos y stock.</p>
        </div>

        <button
          onClick={onNew}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + Nuevo insumo
        </button>
      </div>

      {/* ---------- Tabla principal: INVENTARIO ---------- */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">Insumo</th>
              <th className="px-4 py-3 text-left">Unidad</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Mínimo</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((i) => {
              const sinStock = i.stockActual === 0;
              const bajoStock = !sinStock && i.stockActual <= i.stockMinimo;

              return (
                <tr key={i.idInsumo} className="border-t">
                  <td className="px-4 py-3">{i.nombre}</td>
                  <td className="px-4 py-3">{i.unidadMedida}</td>
                  <td className="px-4 py-3 text-right">{i.stockActual}</td>
                  <td className="px-4 py-3 text-right">{i.stockMinimo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        sinStock
                          ? "bg-slate-100 text-slate-800"
                          : bajoStock
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {sinStock ? "Sin stock" : bajoStock ? "Bajo stock" : "OK"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openMovimiento(i, "Entrada")}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      Entrada
                    </button>

                    <button
                      onClick={() => openMovimiento(i, "Salida")}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      Salida
                    </button>

                    <button
                      onClick={() => openMovimiento(i, "Ajuste")}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      Ajuste
                    </button>

                    <button
                      onClick={() => onEdit(i)}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr className="border-t">
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  No hay insumos cargados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Tabla secundaria: HISTORIAL ---------- */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Últimos movimientos</h2>
          <span className="text-xs text-slate-500">Mostrando {movimientos.length}</span>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Insumo</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-right">Cantidad</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Gasto</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.map((m) => {
              const isNeg = m.cantidad < 0;
              const abs = Math.abs(m.cantidad);

              const fecha = new Date(m.fecha).toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={m.idMovimiento} className="border-t">
                  <td className="px-4 py-3">{fecha}</td>
                  <td className="px-4 py-3">
                    {m.insumo.nombre}
                    <span className="ml-2 text-xs text-slate-500">({m.insumo.unidadMedida})</span>
                  </td>
                  <td className="px-4 py-3">{m.tipo}</td>
                  <td className={`px-4 py-3 text-right ${isNeg ? "text-red-700" : "text-emerald-700"}`}>
                    {isNeg ? "-" : "+"}
                    {abs}
                  </td>
                  <td className="px-4 py-3">
                    {m.usuario.persona.apellido}, {m.usuario.persona.nombre}
                  </td>
                  <td className="px-4 py-3">
                    {m.gastos?.length ? (
                      <div className="text-xs">
                        <div className="font-medium">${m.gastos[0].monto}</div>
                        <div className="text-slate-500">
                          {m.gastos[0].categoria} • {m.gastos[0].concepto}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {movimientos.length === 0 && (
              <tr className="border-t">
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  Todavía no hay movimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Modales ---------- */}
      <InsumoFormModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        insumo={selected}
      />

      <MovimientoStockModal
        open={movOpen}
        onClose={() => setMovOpen(false)}
        insumo={movInsumo}
        tipoInicial={movTipo}
      />
    </div>
  );
}
