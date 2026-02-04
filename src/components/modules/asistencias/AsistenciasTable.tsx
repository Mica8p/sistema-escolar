"use client";

import { EstadoAsistencia } from "@prisma/client";
import { guardarAsistenciaAction } from "@/lib/actions/asistencias-actions";
import { Check, X, Clock, AlertCircle, User, ShieldCheck } from "lucide-react";
import { useTransition } from "react";

interface Props {
  idHorario: number;
  fecha: string;
  matriculas: any[];
  asistenciaByMatricula: [number, any][];
  readOnly?: boolean;
}

export default function AsistenciasTable({ idHorario, fecha, matriculas, asistenciaByMatricula, readOnly = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const asistenciaMap = new Map<number, any>(asistenciaByMatricula);

  const handleToggleAsistencia = (idMatricula: number, estado: EstadoAsistencia) => {
    if (readOnly) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("idMatricula", String(idMatricula));
      formData.append("idHorario", String(idHorario));
      formData.append("fecha", fecha);
      formData.append("estado", estado);

      await guardarAsistenciaAction(formData);
    });
  };

  return (
    <div className={`w-full overflow-x-auto ${isPending ? "opacity-70" : ""}`}>
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-800 text-white uppercase text-[10px] tracking-widest">
          <tr>
            <th className="px-6 py-5 font-black">Alumno / Legajo</th>
            <th className="px-6 py-5 font-black text-center">Estado Actual</th>
            {!readOnly && <th className="px-6 py-5 font-black text-center">Marcar Asistencia</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 bg-white">
          {matriculas.map((m) => {
            const registro = asistenciaMap.get(m.idMatricula);
            // Normalizamos para que coincida con los botones
            const estadoActual = registro?.estado?.toUpperCase();

            return (
              <tr key={m.idMatricula} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-full text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm uppercase">{m.alumno.persona.apellido}, {m.alumno.persona.nombre}</div>
                      <div className="text-[10px] text-slate-500 font-mono">LEGAJO: {m.alumno.legajo}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                   {estadoActual ? (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        estadoActual === "PRESENTE" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        estadoActual === "AUSENTE" ? "bg-red-100 text-red-700 border-red-200" :
                        estadoActual === "TARDE" ? "bg-amber-100 text-amber-700 border-amber-200" :
                        "bg-blue-100 text-blue-700 border-blue-200"
                      }`}>
                        {estadoActual}
                      </span>
                   ) : <span className="text-slate-300 text-[10px] font-bold">PENDIENTE</span>}
                </td>

                {!readOnly && (
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {/* --- BOTONES CON TUS COLORES ORIGINALES --- */}

                      {/* PRESENTE - VERDE */}
                      <button
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Presente")}
                        className={`p-2.5 rounded-xl transition-all ${estadoActual === "PRESENTE" ? "bg-emerald-500 text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"}`}
                      >
                        <Check size={20} strokeWidth={3} />
                      </button>

                      {/* AUSENTE - ROJO */}
                      <button
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Ausente")}
                        className={`p-2.5 rounded-xl transition-all ${estadoActual === "AUSENTE" ? "bg-red-500 text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600"}`}
                      >
                        <X size={20} strokeWidth={3} />
                      </button>

                      {/* TARDE - AMARILLO/NARANJA */}
                      <button
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Tarde")}
                        className={`p-2.5 rounded-xl transition-all ${estadoActual === "TARDE" ? "bg-amber-400 text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-500"}`}
                      >
                        <Clock size={20} strokeWidth={3} />
                      </button>

                      {/* JUSTIFICADO - AZUL */}
                      <button
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Justificado")}
                        className={`p-2.5 rounded-xl transition-all ${estadoActual === "JUSTIFICADO" ? "bg-blue-500 text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-500"}`}
                      >
                        <AlertCircle size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}