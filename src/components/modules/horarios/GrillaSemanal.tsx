// src/components/modules/horarios/GrillaSemanal.tsx
"use client";

import { Clock, MapPin } from "lucide-react";

export default function GrillaSemanal({ horarios, compact = false }: { horarios: any[]; compact?: boolean }) {
  const bloques = Array.from(new Set(horarios.map(h => h.horaInicio))).sort();
  const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];

  // 🚩 Quitamos animaciones para descartar que el fade-in esté fallando
  return (
    <div className="w-full border border-slate-200 rounded-[2rem] bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        {/* Usamos min-w-max para que la tabla siempre ocupe su espacio real */}
        <table className="min-w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="w-24 p-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-800">Bloque</th>
              {DIAS.map(dia => (
                <th key={dia} className="p-4 text-[10px] font-black uppercase tracking-widest min-w-[150px]">
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bloques.map((hora) => (
              <tr key={hora}>
                <td className="p-4 text-center bg-slate-50 border-r border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 flex items-center justify-center gap-1">
                    <Clock size={12} /> {hora} hs
                  </span>
                </td>
                {DIAS.map(dia => {
                  const item = horarios.find(h => h.diaSemana === dia && h.horaInicio === hora);
                  return (
                    <td key={dia} className="p-2 h-24 vertical-top">
                      {item ? (
                        <div className="h-full bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                          <p className="text-[10px] font-black text-indigo-700 uppercase leading-tight">
                            {item.asignacion.materia.nombre}
                          </p>
                          <div className="flex items-center gap-1 text-[8px] font-bold text-indigo-400 uppercase mt-auto">
                            <MapPin size={10} /> {item.aula || "S/A"}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full border border-dashed border-slate-100 rounded-2xl bg-slate-50/20" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}