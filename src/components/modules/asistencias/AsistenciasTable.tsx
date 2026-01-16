"use client";

import { EstadoAsistencia } from "@prisma/client";
import { guardarAsistenciaAction } from "@/lib/actions/asistencias-actions";
import { Check, X, Clock, AlertCircle, User, ShieldCheck } from "lucide-react";

interface Props {
  idAsignacion: number;
  idHorario: number;
  fecha: string; // ISO string
  matriculas: any[];
  asistenciaByMatricula: [number, any][];
  readOnly?: boolean;
}

export default function AsistenciasTable({
  idAsignacion,
  idHorario,
  fecha,
  matriculas,
  asistenciaByMatricula,
  readOnly = false,
}: Props) {
  const asistenciaMap = new Map<number, any>(asistenciaByMatricula);

  // Función para manejar el clic en los botones de asistencia
  const handleToggleAsistencia = async (idMatricula: number, estado: EstadoAsistencia) => {
    if (readOnly) return;

    const formData = new FormData();
    formData.append("idMatricula", String(idMatricula));
    formData.append("idHorario", String(idHorario));
    formData.append("fecha", fecha);
    formData.append("estado", estado);

    await guardarAsistenciaAction(formData);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-800 text-white uppercase text-[10px] tracking-[0.15em]">
          <tr>
            <th className="px-6 py-5 font-black">Alumno / Legajo</th>
            <th className="px-6 py-5 font-black text-center">Estado Actual</th>
            {!readOnly && <th className="px-6 py-5 font-black text-center">Marcar Asistencia</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {matriculas.map((m) => {
            const registro = asistenciaMap.get(m.idMatricula);
            const estadoActual = registro?.estado as EstadoAsistencia | undefined;

            return (
              <tr key={m.idMatricula} className="hover:bg-slate-50 transition-all group">
                {/* INFO ALUMNO */}
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-full text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-base leading-tight uppercase">
                        {m.alumno.persona.apellido}, {m.alumno.persona.nombre}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-1 uppercase">
                        LEGAJO: {m.alumno.legajo}
                      </div>
                    </div>
                  </div>
                </td>

                {/* ESTADO ACTUAL (Visual para todos) */}
                <td className="px-6 py-6">
                  <div className="flex justify-center">
                    {estadoActual ? (
                      <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border-2 ${
                        estadoActual === "Presente" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        estadoActual === "Ausente" ? "bg-rose-50 text-rose-600 border-rose-100" :
                        estadoActual === "Tarde" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {estadoActual === "Presente" && <Check size={12} />}
                        {estadoActual === "Ausente" && <X size={12} />}
                        {estadoActual === "Tarde" && <Clock size={12} />}
                        {estadoActual === "Justificado" && <AlertCircle size={12} />}
                        {estadoActual}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sin registrar</span>
                    )}
                  </div>
                </td>

                {/* BOTONES DE ACCIÓN (SOLO DOCENTE) */}
                {!readOnly && (
                  <td className="px-6 py-6">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Presente")}
                        className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                          estadoActual === "Presente" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                        }`}
                        title="Presente"
                      >
                        <Check size={20} strokeWidth={3} />
                      </button>

                      <button
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Ausente")}
                        className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                          estadoActual === "Ausente" ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : "bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                        }`}
                        title="Ausente"
                      >
                        <X size={20} strokeWidth={3} />
                      </button>

                      <button
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Tarde")}
                        className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                          estadoActual === "Tarde" ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-500"
                        }`}
                        title="Tarde"
                      >
                        <Clock size={20} strokeWidth={3} />
                      </button>

                      <button
                        onClick={() => handleToggleAsistencia(m.idMatricula, "Justificado")}
                        className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                          estadoActual === "Justificado" ? "bg-blue-500 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-500"
                        }`}
                        title="Justificado"
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

      {/* MENSAJE DE SEGURIDAD PARA ADMIN */}
      {readOnly && (
        <div className="p-4 bg-indigo-50 border-t border-indigo-100 flex items-center justify-center gap-2 text-indigo-600">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Vista de auditoría: El administrador no puede modificar asistencias diarias</span>
        </div>
      )}
    </div>
  );
}