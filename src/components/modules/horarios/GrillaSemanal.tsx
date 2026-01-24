"use client";

import { Clock, MapPin } from "lucide-react";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];

export default function GrillaSemanal({ horarios }: { horarios: any[] }) {
  const bloques = Array.from(new Set(horarios.map(h => h.horaInicio))).sort();

  console.log("Horarios recibidos:", horarios);

  return (
    <div className="overflow-x-auto rounded-[2.5rem] border border-slate-200 bg-white shadow-sm animate-in fade-in duration-700">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-slate-800">Bloque</th>
            {DIAS.map(dia => (
              <th key={dia} className="p-5 text-[10px] font-black uppercase tracking-[0.2em]">{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">

          {bloques.length === 0 && (
             <tr>
               <td colSpan={6} className="p-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                 No hay horarios asignados para este curso
               </td>
             </tr>
          )}

          {bloques.map((horaInicio) => (
            <tr key={horaInicio} className="hover:bg-slate-50/30 transition-colors">
              <td className="p-5 text-center border-r border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-400 flex items-center justify-center gap-2">
                  <Clock size={12} /> {horaInicio} hs
                </span>
              </td>
              {DIAS.map(dia => {
                const item = horarios.find(h => h.diaSemana === dia && h.horaInicio === horaInicio);

                return (
                  <td key={dia} className="p-3 min-w-[160px h-28">
                    {item ? (
                      <div className="h-full bg-indigo-50 border-2 border-indigo-100 rounded-[1.5rem p-4 flex flex-col justify-between shadow-sm">
                        <div>
                          <p className="text-[10px] font-black text-indigo-700 uppercase leading-tight mb-1">
                            {item.asignacion.materia.nombre}
                          </p>
                          <p className="text-[9px] font-bold text-indigo-300 uppercase">
                            Prof. {item.asignacion.profesor.persona.apellido}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-indigo-400 uppercase">
                          <MapPin size={10} /> {item.aula || "S/A"}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full border-2 border-dashed border-slate-50 rounded-[1.5rem" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}