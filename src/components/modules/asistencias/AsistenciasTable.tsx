"use client";

import { EstadoAsistencia } from "@prisma/client";
import { guardarAsistenciaAction } from "@/lib/actions/asistencias-actions";
import { Check, X, Clock, AlertCircle, User } from "lucide-react";
import { useTransition } from "react";

interface Props {
  idHorario: number;
  fecha: string;
  matriculas: any[];
  asistenciaByMatricula: [number, any][];
  readOnly?: boolean;
  idAsignacion: number;
  onAsistenciaChange?: (idMatricula: number, estado: EstadoAsistencia) => void;
}

export default function AsistenciasTable({
  idHorario,
  fecha,
  matriculas,
  asistenciaByMatricula,
  readOnly = false,
  onAsistenciaChange
}: Props) {
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

      const res = await guardarAsistenciaAction(formData);

      if (res?.success && onAsistenciaChange) {
        onAsistenciaChange(idMatricula, estado);
      }
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
            const estadoActual = registro?.estado?.toUpperCase();

            return (
              <tr key={m.idMatricula} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-full text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm uppercase">
                        {m.alumno.persona.apellido}, {m.alumno.persona.nombre}
                      </div>
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
                   ) : <span className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-tighter">
                        ● Sin Registrar
                      </span>}
                </td>

                {/* BOTONES */}
                {!readOnly && (
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <AsistBtn
                        active={estadoActual === "PRESENTE"}
                        color="bg-emerald-500"
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Presente")}
                        icon={<Check size={20} strokeWidth={3}/>}
                      />
                      <AsistBtn
                        active={estadoActual === "AUSENTE"}
                        color="bg-red-500"
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Ausente")}
                        icon={<X size={20} strokeWidth={3}/>}
                      />
                      <AsistBtn
                        active={estadoActual === "TARDE"}
                        color="bg-amber-400"
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Tarde")}
                        icon={<Clock size={20} strokeWidth={3}/>}
                      />
                      <AsistBtn
                        active={estadoActual === "JUSTIFICADO"}
                        color="bg-blue-500"
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Justificado")}
                        icon={<AlertCircle size={20} strokeWidth={3}/>}
                      />
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

function AsistBtn({ active, color, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all ${
        active
          ? `${color} text-white shadow-lg scale-110`
          : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
      }`}
    >
      {icon}
    </button>
  );
}