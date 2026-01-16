"use client";

import { TipoEvaluacion } from "@prisma/client";
import { guardarNotaAction } from "@/lib/actions/calificaciones-actions";
import { Save, AlertCircle, CheckCircle2, User } from "lucide-react";

interface Props {
  idAsignacion: number;
  idPeriodo: number;
  tipo: TipoEvaluacion;
  matriculas: any[];
  notaByMatricula: [number, any][];
  readOnly?: boolean;
}

export default function CalificacionesTable({
  idAsignacion,
  idPeriodo,
  tipo,
  matriculas,
  notaByMatricula,
  readOnly = false,
}: Props) {
  const notaMap = new Map<number, any>(notaByMatricula);

  // LA SOLUCIÓN AL ERROR:
  // Esta función intermedia recibe el formData y llama a la acción de Juan
  // pasándole un 'null' inicial para que no proteste por los argumentos.
  const handleAction = async (formData: FormData) => {
    await guardarNotaAction(null, formData);
  };

  return (
    <div className="w-full overflow-x-auto bg-white">
      <table className="w-full text-sm text-left border-collapse">
        {/* ENCABEZADO CON CONTRASTE ALTO */}
        <thead className="bg-slate-800 text-white uppercase text-[10px] tracking-[0.15em]">
          <tr>
            <th className="px-6 py-5 font-black">Alumno / Legajo</th>
            <th className="px-6 py-5 font-black w-[160px">Calificación</th>
            <th className="px-6 py-5 font-black">Observaciones Académicas</th>
            {!readOnly && <th className="px-6 py-5 font-black w-[140px text-center">Gestión</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {matriculas.map((m) => {
            const n = notaMap.get(m.idMatricula);
            const tieneNota = !!n;

            return (
              <tr key={m.idMatricula} className="hover:bg-slate-50 transition-all group">
                {/* INFO ALUMNO */}
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex p-2 bg-slate-100 rounded-full text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-base leading-tight uppercase">
                        {m.alumno.persona.apellido}, {m.alumno.persona.nombre}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-1">
                        LEGAJO: {m.alumno.legajo} • MATRÍCULA: #{m.idMatricula}
                      </div>
                    </div>
                  </div>
                </td>

                {/* CALIFICACIÓN */}
                <td className="px-6 py-6">
                  <div className="relative w-28">
                    <input
                      form={`f-${m.idMatricula}`}
                      name="nota"
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      defaultValue={n?.nota ?? ""}
                      readOnly={readOnly}
                      disabled={readOnly}
                      placeholder="-"
                      className={`w-full text-center text-xl font-black rounded-2xl py-3 px-2 transition-all outline-none ${
                        readOnly
                          ? "bg-transparent text-indigo-700 cursor-default"
                          : "bg-slate-50 border-2 border-slate-200 text-slate-800 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                      }`}
                    />
                  </div>
                </td>

                {/* OBSERVACIONES */}
                <td className="px-6 py-6">
                  <div className="space-y-2">
                    <input
                      form={`f-${m.idMatricula}`}
                      name="observacion"
                      defaultValue={n?.observacion ?? ""}
                      readOnly={readOnly}
                      disabled={readOnly}
                      placeholder={readOnly ? "Sin comentarios" : "Ej: Ausente con aviso, tarea incompleta..."}
                      className={`w-full py-3 px-4 rounded-2xl text-xs transition-all outline-none ${
                        readOnly
                          ? "bg-transparent italic text-slate-400 cursor-default"
                          : "bg-slate-50 border-2 border-slate-200 text-slate-700 focus:border-indigo-600"
                      }`}
                    />
                    {n?.updatedAt && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        ACTUALIZADO: {new Date(n.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>

                {/* BOTÓN DE ACCIÓN (SOLO DOCENTE) */}
                {!readOnly && (
                  <td className="px-6 py-6">
                    <form
                      id={`f-${m.idMatricula}`}
                      action={handleAction} // USAMOS LA FUNCIÓN INTERMEDIA
                      className="flex flex-col gap-2"
                    >
                      <input type="hidden" name="idMatricula" value={m.idMatricula} />
                      <input type="hidden" name="idAsignacion" value={idAsignacion} />
                      <input type="hidden" name="idPeriodo" value={idPeriodo} />
                      <input type="hidden" name="tipo" value={tipo} />

                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                      >
                        <Save size={14} /> Guardar
                      </button>

                      <div className={`text-[9px] text-center font-bold uppercase tracking-tighter ${tieneNota ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {tieneNota ? "Modificar Nota" : "Pendiente"}
                      </div>
                    </form>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* FOOTER VACÍO O INFO */}
      {matriculas.length === 0 && (
        <div className="p-20 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
          <AlertCircle size={48} strokeWidth={1.5} className="text-slate-200" />
          <p className="text-sm font-bold uppercase tracking-widest">No hay alumnos matriculados</p>
        </div>
      )}
    </div>
  );
}