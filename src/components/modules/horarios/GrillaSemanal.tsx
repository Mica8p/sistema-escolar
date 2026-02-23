"use client";

import { Clock, MapPin } from "lucide-react";

export default function GrillaSemanal({ horarios, compact = false }: { horarios: any[]; compact?: boolean }) {
  const bloquesUnicos = Array.from(
    new Set(horarios.map(h => `${h.horaInicio} - ${h.horaFin}`))
  ).sort();

  const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];

  return (
    <div className="w-full border border-slate-200 rounded-[2rem] bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="w-32 p-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-800">Bloque</th>
              {DIAS.map(dia => (
                <th key={dia} className="p-4 text-[10px] font-black uppercase tracking-widest">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bloquesUnicos.map((rango) => {
              const [hInicio] = rango.split(" - ");
              return (
                <tr key={rango}>
                  <td className="p-4 text-center bg-slate-50 border-r border-slate-100">
                    <span className="text-[9px] font-black text-slate-500 flex flex-col items-center leading-tight">
                      <Clock size={12} className="mb-1" />
                      {rango}
                    </span>
                  </td>
                  {DIAS.map(dia => {
                    const item = horarios.find(h => h.diaSemana === dia && h.horaInicio === hInicio);
                    return (
                      <td key={dia} className="p-2 h-28">
                        {item ? (
                          <div className="h-full bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex flex-col shadow-sm">
                            <p className="text-[10px] font-black text-indigo-700 uppercase leading-none mb-1">
                              {item.asignacion.materia.nombre}
                            </p>

                            {item.asignacion.curso && (
                              <p className="text-[8px] font-black text-indigo-400 uppercase">
                                {item.asignacion.curso.grado}° "{item.asignacion.curso.seccion}"
                              </p>
                            )}
                            <p className="text-[9px] font-bold text-slate-500 mt-1">
                              {item.asignacion.profesor?.persona?.apellido || "Sin asignar"}
                            </p>
                            <div className="flex items-center gap-1 text-[8px] font-black text-indigo-400 uppercase mt-auto">
                              <MapPin size={10} /> {item.aula || "AULA -"}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full border border-dashed border-slate-100 rounded-2xl bg-slate-50/20" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}