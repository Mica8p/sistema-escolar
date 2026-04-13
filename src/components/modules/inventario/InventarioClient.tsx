"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { consumirInsumo } from "@/lib/actions/movimiento-stock-actions";
import InsumoFormModal from "./InsumoFormModal";
import MovimientoStockModal from "./MovimientoStockModal";
import PaginationControls from "@/components/shared/PaginationControls";
import {
  Archive,
  Package,
  AlertTriangle,
  PlusCircle,
  Pencil,
  Search,
  Plus,
  ShoppingCart,
  MinusCircle,
  ChevronDown,
} from "lucide-react";

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
  totalGastos,
}: {
  insumos: Insumo[];
  movimientos: Movimiento[];
  totalGastos: number;
}) {
  /* ---------- Insumos (alta / edición) ---------- */
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Insumo | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "alerta" | "sin-stock">("todos");
  const [activeTab, setActiveTab] = useState<"stock" | "historial">("stock");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().getMonth();
  });

  const [consumoLoading, setConsumoLoading] = useState<number | null>(null);
  const router = useRouter();

  /* ---------- Movimientos de stock ---------- */
  const [movOpen, setMovOpen] = useState(false);
  const [movInsumo, setMovInsumo] = useState<Insumo | null>(null);
  const [movTipo, setMovTipo] = useState<"Entrada" | "Salida" | "Ajuste">("Salida");

  const openMovimiento = (i: Insumo, tipo: "Entrada" | "Salida" | "Ajuste") => {
    setMovInsumo(i);
    setMovTipo(tipo);
    setMovOpen(true);
  };

  const onConsumir = async (insumo: Insumo) => {
    setConsumoLoading(insumo.idInsumo);
    try {
      const res = await consumirInsumo(insumo.idInsumo);
      if (!res.success) {
        alert(res.message);
      }
    } finally {
      setConsumoLoading(null);
    }
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

  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? "1";
  const per_page = searchParams.get("per_page") ?? "5";

  const start = (Number(page) - 1) * Number(per_page);
  const end = start + Number(per_page);

  const filteredInsumos = useMemo(() => {
    return insumos.filter((insumo) => {
      // Filtro de búsqueda
      if (searchTerm && !insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Filtro de estado
      const sinStock = insumo.stockActual === 0;
      const bajoStock = !sinStock && insumo.stockActual <= insumo.stockMinimo;

      if (statusFilter === "alerta") return bajoStock;
      if (statusFilter === "sin-stock") return sinStock;

      return true;
    });
  }, [insumos, searchTerm, statusFilter]);

  const paginatedInsumos = useMemo(
    () => filteredInsumos.slice(start, end),
    [filteredInsumos, start, end]
  );

  const rows = paginatedInsumos;

  const page_mov = searchParams.get("page_mov") ?? "1";
  const per_page_mov = searchParams.get("per_page_mov") ?? "5";

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const monthlyFilteredMovimientos = useMemo(() => {
    return movimientos.filter(m => {
        const movDate = new Date(m.fecha);
        return movDate.getMonth() === selectedMonth;
    });
  }, [movimientos, selectedMonth]);

  const start_mov = (Number(page_mov) - 1) * Number(per_page_mov);
  const end_mov = start_mov + Number(per_page_mov);

  const paginatedMovimientos = useMemo(
    () => monthlyFilteredMovimientos.slice(start_mov, end_mov),
    [monthlyFilteredMovimientos, start_mov, end_mov]
  );

  const totalInsumos = insumos.length;
  const insumosEnAlerta = insumos.filter((i) => i.stockActual > 0 && i.stockActual <= i.stockMinimo).length;
  const insumosSinStock = insumos.filter((i) => i.stockActual === 0).length;

  return (
    <div className="space-y-8">
      {/* ---------- Header ---------- */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
          <p className="text-slate-600">
            Gestión de insumos, stock y movimientos.
          </p>
        </div>

        <button
          onClick={onNew}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
        >
          <Plus size={18} />
          Nuevo insumo
        </button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard icon={<Package size={24} />} title="Total de Insumos" value={totalInsumos} color="blue" />
        <KpiCard icon={<AlertTriangle size={24} />} title="Insumos en Alerta" value={insumosEnAlerta} color="red" />
        <KpiCard icon={<Archive size={24} />} title="Insumos sin Stock" value={insumosSinStock} color="slate" />
        <KpiCard 
          icon={<Package size={24} />} 
          title="Gastos del Ciclo" 
          value={`$${totalGastos.toLocaleString('es-AR')}`} 
          color="blue" 
        />
      </div>

      {/* ---------- Tabs ---------- */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabButton title="Stock Actual" isActive={activeTab === "stock"} onClick={() => setActiveTab("stock")} />
          <TabButton title="Historial de Movimientos" isActive={activeTab === "historial"} onClick={() => setActiveTab("historial")} />
        </nav>
      </div>

      {activeTab === "stock" && (
        <div className="space-y-4">
          {/* ---------- Filtros y Búsqueda ---------- */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterChip label="Todos" isActive={statusFilter === "todos"} onClick={() => setStatusFilter("todos")} />
              <FilterChip label="En Alerta" isActive={statusFilter === "alerta"} onClick={() => setStatusFilter("alerta")} />
              <FilterChip label="Sin Stock" isActive={statusFilter === "sin-stock"} onClick={() => setStatusFilter("sin-stock")} />
            </div>
          </div>

          {/* ---------- Tabla principal: INVENTARIO ---------- */}
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Insumo</th>
                  <th className="px-4 py-3 text-left font-semibold">Unidad</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Mínimo</th>
                  <th className="px-4 py-3 text-left font-semibold">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => {
                  const sinStock = i.stockActual === 0;
                  const bajoStock = !sinStock && i.stockActual <= i.stockMinimo;
                  return (
                    <tr key={i.idInsumo} className="border-t text-gray-700 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium">{i.nombre}</td>
                      <td className="px-4 py-3">{i.unidadMedida}</td>
                      <td className="px-4 py-3 text-right font-bold">{i.stockActual}</td>
                      <td className="px-4 py-3 text-right">{i.stockMinimo}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${sinStock ? "bg-slate-100 text-slate-800" : bajoStock ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                          {sinStock ? "Sin stock" : bajoStock ? "Bajo stock" : "OK"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            title="Consumo" 
                            onClick={() => onConsumir(i)} 
                            className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                            disabled={consumoLoading === i.idInsumo || i.stockActual === 0}
                          >
                            <MinusCircle size={20} />
                          </button>
                          <button 
                            title="Reposición" 
                            onClick={() => openMovimiento(i, "Entrada")} 
                            className="text-emerald-600 hover:text-emerald-800 transition-colors disabled:opacity-50"
                            disabled={consumoLoading === i.idInsumo}
                          >
                            <ShoppingCart size={20} />
                          </button>
                          <div className="h-5 w-px bg-slate-200"></div>
                          <button 
                            title="Editar Insumo" 
                            onClick={() => onEdit(i)} 
                            className="text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>
                      {searchTerm || statusFilter !== "todos" ? "No se encontraron insumos con esos filtros." : "No hay insumos cargados todavía."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationControls currentPage={Number(page)} totalPages={Math.ceil(filteredInsumos.length / Number(per_page))} />
          </div>
        </div>
      )}

      {activeTab === "historial" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border bg-white p-3 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700">Filtrar por mes:</h3>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            >
              {monthNames.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">Movimientos de {monthNames[selectedMonth]}</h2>
              <span className="text-xs text-gray-600">
                Total: {monthlyFilteredMovimientos.length}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold">Insumo</th>
                  <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                  <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
                  <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold">Gasto Asociado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMovimientos.map((m) => {
                  const isNeg = m.tipo === "Salida" || (m.tipo === "Ajuste" && m.cantidad < 0);
                  const isPos = m.tipo === "Entrada" || (m.tipo === "Ajuste" && m.cantidad > 0);
                  const fecha = new Date(m.fecha).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

                  return (
                    <tr key={m.idMovimiento} className="border-t text-gray-800 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-600">{fecha}</td>
                      <td className="px-4 py-3 font-medium">{m.insumo.nombre}</td>
                      <td className="px-4 py-3">{m.tipo}</td>
                      <td className={`px-4 py-3 text-right font-bold ${isNeg ? "text-red-600" : isPos ? "text-emerald-600" : "text-slate-600"}`}>
                        {isPos && "+"}
                        {m.cantidad}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {m.usuario.persona.apellido}, {m.usuario.persona.nombre}
                      </td>
                      <td className="px-4 py-3">
                        {m.gastos?.length ? (
                          <div className="text-xs">
                            <div className="font-bold text-gray-800">${m.gastos[0].monto.toLocaleString()}</div>
                            <div className="text-gray-600 line-clamp-1">{m.gastos[0].concepto || m.gastos[0].categoria}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {monthlyFilteredMovimientos.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>
                      No hay movimientos registrados para este mes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {monthlyFilteredMovimientos.length > Number(per_page_mov) && (
              <PaginationControls
                currentPage={Number(page_mov)}
                totalPages={Math.ceil(
                  monthlyFilteredMovimientos.length / Number(per_page_mov)
                )}
                pageParam="page_mov"
              />
            )}
          </div>
        </div>
      )}

      {/* ---------- Modales ---------- */}
      <InsumoFormModal open={open} onClose={() => setOpen(false)} mode={mode} insumo={selected} />
      <MovimientoStockModal open={movOpen} onClose={() => setMovOpen(false)} insumo={movInsumo} tipoInicial={movTipo} />
    </div>
  );
}

const KpiCard = ({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number | string; color: "blue" | "red" | "slate" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    slate: "bg-slate-200 text-slate-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const TabButton = ({ title, isActive, onClick }: { title: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`${
      isActive ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
    } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
  >
    {title}
  </button>
);

const FilterChip = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
      isActive ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-200 border"
    }`}
  >
    {label}
  </button>
);
