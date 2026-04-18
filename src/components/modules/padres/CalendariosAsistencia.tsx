"use client";

import { Calendar, CheckCircle2, XCircle, Clock, ShieldCheck, Filter } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useState, useMemo } from "react";

interface Asistencia {
  idAsistencia: number;
  fecha: Date;
  estado?: string;
  horario: {
    horaInicio: string;
    horaFin?: string;
    asignacion: {
      materia: { nombre: string };
    };
  };
}

const CONFIG_ESTADO: Record<string, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  PRESENTE: {
    label: "PRESENTE",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: CheckCircle2
  },
  AUSENTE: {
    label: "AUSENTE",
    color: "text-rose-600",
    bg: "bg-rose-50",
    icon: XCircle
  },
  TARDE: {
    label: "TARDE",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: Clock
  },
  JUSTIFICADA: {
    label: "JUSTIFICADA",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    icon: ShieldCheck
  },
};

export default function CalendarioAsistencia({ asistencias }: { asistencias: Asistencia[] }) {
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 7;

  // Obtener fechas únicas para validar que existan
  const fechasUnicas = useMemo(() => {
    const fechas = new Set<string>();
    asistencias.forEach(a => {
      const fecha = new Date(a.fecha).toISOString().split('T')[0];
      fechas.add(fecha);
    });
    return Array.from(fechas).sort().reverse();
  }, [asistencias]);

  // Obtener min y max fecha para el date input
  const minMaxFechas = useMemo(() => {
    if (fechasUnicas.length === 0) return { min: "", max: "" };
    return {
      min: fechasUnicas[fechasUnicas.length - 1],
      max: fechasUnicas[0]
    };
  }, [fechasUnicas]);

  // Filtrar asistencias
  const asistenciasFiltradas = useMemo(() => {
    let resultado = asistencias;

    // Filtro de fecha
    if (fechaFiltro) {
      resultado = resultado.filter(a => {
        const fechaAsistencia = new Date(a.fecha).toISOString().split('T')[0];
        return fechaAsistencia === fechaFiltro;
      });
    }

    // Filtro de estado (solo si es diferente de vacío y de "TODAS")
    if (estadoFiltro && estadoFiltro !== "TODAS") {
      resultado = resultado.filter(a => {
        const estadoKey = a.estado?.toUpperCase() || "PRESENTE";
        return estadoKey === estadoFiltro;
      });
    }

    return resultado;
  }, [asistencias, fechaFiltro, estadoFiltro]);

  // Paginación
  const totalPaginas = Math.ceil(asistenciasFiltradas.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const asistenciasEnPagina = asistenciasFiltradas.slice(inicio, fin);

  // Resetear página cuando cambien filtros
  const handleFechaChange = (nuevaFecha: string) => {
    setFechaFiltro(nuevaFecha);
    setPaginaActual(1);
  };

  const handleEstadoChange = (nuevoEstado: string) => {
    setEstadoFiltro(nuevoEstado);
    setPaginaActual(1);
  };



  return (
    <div className="space-y-6">
      {/* FILTROS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-indigo-600" />
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro de Fecha - Input Date (Calendario) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
              Seleccionar Fecha
            </label>
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => handleFechaChange(e.target.value)}
              min={minMaxFechas.min}
              max={minMaxFechas.max}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            />
            {fechaFiltro && (
              <button
                onClick={() => handleFechaChange("")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
              >
                Limpiar fecha
              </button>
            )}
          </div>

          {/* Filtro de Estado - "Ver" */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
              Ver
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => handleEstadoChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- Seleccione lo que desea ver --</option>
              <option value="TODAS">Todas (Presentes, Ausentes, Justificadas, Tardías)</option>
              <option value="PRESENTE">Presentes</option>
              <option value="AUSENTE">Ausentes</option>
              <option value="JUSTIFICADA">Justificadas</option>
              <option value="TARDE">Tardías</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      {!estadoFiltro ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-12 text-center">
          <p className="text-slate-500 italic">Seleccione una opción en &quot;Ver&quot; para mostrar el historial de asistencia.</p>
        </div>
      ) : asistenciasFiltradas.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-12 text-center">
          <p className="text-slate-500 italic">No hay registros que coincidan con los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {asistenciasEnPagina.map((reg: Asistencia) => {
                const estadoKey = reg.estado?.toUpperCase() || "PRESENTE";
                const config = CONFIG_ESTADO[estadoKey] || CONFIG_ESTADO.PRESENTE;
                const Icono = config.icon;
                const fechaLabel = new Date(reg.fecha).toLocaleDateString('es-AR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short'
                });

                return (
                  <div key={reg.idAsistencia} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-2xl ${config.bg} ${config.color} shrink-0`}>
                        <Icono size={20} />
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm uppercase leading-none mb-1">
                          {reg.horario.asignacion.materia.nombre}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                          <Calendar size={12} />
                          {fechaLabel}
                          <span className="mx-1">•</span>
                          <Clock size={12} />
                          {reg.horario.horaInicio} hs. - {reg.horario.horaFin || "--:--"} hs.
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${config.bg} ${config.color} shrink-0`}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 flex items-center justify-between">
              <div className="text-sm text-slate-600 font-medium">
                Mostrando <span className="font-bold text-slate-900">{inicio + 1}</span> a <span className="font-bold text-slate-900">{Math.min(fin, asistenciasFiltradas.length)}</span> de <span className="font-bold text-slate-900">{asistenciasFiltradas.length}</span> registros
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setPaginaActual(page)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                        paginaActual === page
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}