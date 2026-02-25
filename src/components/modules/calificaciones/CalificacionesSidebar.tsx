"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function CalificacionesSidebar({ asignaciones, idAsignacion, idPeriodo, tipo }: any) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    return asignaciones.filter((a: any) =>
      a.materia.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [asignaciones, busqueda]);

  const getUrl = (asigId: number) => {
    const p = new URLSearchParams();
    p.set("asig", String(asigId));
    p.set("tipo", String(tipo));
    return `?${p.toString()}`;
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-50 bg-slate-50/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Buscar materia..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase outline-none focus:ring-2 ring-indigo-500 transition-all text-slate-700"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {filtradas.map((a: any) => (
          <Link
            key={a.idAsignacion}
            href={getUrl(a.idAsignacion)}
            className={`block px-4 py-3 rounded-xl border transition-all ${
              a.idAsignacion === idAsignacion
                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                : "bg-white border-slate-100 hover:border-indigo-200 text-slate-600 hover:bg-indigo-50/30"
            }`}
          >
            <div className="flex flex-col gap-1">
              <div className={`font-bold text-sm ${a.idAsignacion === idAsignacion ? 'text-white' : 'text-slate-800'}`}>
                {a.materia.nombre}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                  a.idAsignacion === idAsignacion ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {a.curso.turno}
                </span>
                <div className={`text-[10px] font-medium ${a.idAsignacion === idAsignacion ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {a.curso.grado}° {a.curso.seccion}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}