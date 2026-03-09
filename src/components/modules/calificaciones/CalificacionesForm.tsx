"use client";

import { Nota } from "@prisma/client";
import { guardarNotaAction } from "@/lib/actions/calificaciones-actions";
import { Save, User, Edit2, Lock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PeriodoActual {
  idPeriodo: number;
  nombre: string;
  cerrado: boolean;
}

interface NotaWithPeriodo extends Nota {
  periodo: {
    nombre: string;
  };
}

interface MatriculaConAlumno {
  idMatricula: number;
  alumno: {
    legajo: string;
    persona: {
      nombre: string;
      apellido: string;
    };
  };
}

interface CalificacionesTableProps {
  idAsignacion: number;
  idPeriodo: number;
  periodoActual: PeriodoActual;
  tipo: string; // Asumiendo que 'tipo' es un string como "Parcial", "Recuperatorio"
  matriculas: MatriculaConAlumno[];
  notaByMatricula: Map<number, Nota>;
  readOnly?: boolean;
  historialNotas: NotaWithPeriodo[];
}

export default function CalificacionesTable({
  idAsignacion,
  idPeriodo,
  periodoActual,
  tipo,
  matriculas,
  notaByMatricula,
  readOnly = false,
  historialNotas = []
}: CalificacionesTableProps) {
  const router = useRouter();
  const [editando, setEditando] = useState<number | null>(null);
  const notaMap = new Map<number, Nota>(notaByMatricula);

  // 1. LÓGICA GLOBAL DE PERIODO
  const periodoCerrado = periodoActual?.cerrado;
  const nombrePeriodo = periodoActual?.nombre;
  const esInstanciaDeCierre = ["DICIEMBRE", "FEBRERO", "JULIO_PREVIAS"].includes(nombrePeriodo);

  const handleAction = async (formData: FormData) => {
    const res = await guardarNotaAction(null, formData);
    if (res.ok) {
      toast.success("Calificación guardada");
      setEditando(null);
      router.refresh();
    }
  };

  const getNotaTrimestre = (alumnoId: number, nombreTrimestre: string) => {
    const notasTrim = historialNotas.filter((n: NotaWithPeriodo) =>
      n.idMatricula === alumnoId && n.periodo.nombre === nombreTrimestre
    );
    const parcial = notasTrim.find((n: NotaWithPeriodo) => n.tipo === "Parcial")?.nota || 0;
    const recuperatorio = notasTrim.find((n: NotaWithPeriodo) => n.tipo === "Recuperatorio")?.nota || 0;
    return Math.max(parcial, recuperatorio);
  };

  return (
    <div className="w-full">
      {/* CARTEL DE CIERRE (ADMIN) */}
      {periodoCerrado && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase mb-6 w-fit mx-auto border border-amber-100 shadow-sm">
          <Lock size={14} className="text-amber-500" />
          Trimestre Cerrado por Administración
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
            <tr>
              <th className="px-6 py-4 text-left">Alumno</th>
              <th className="px-6 py-4 text-center">Nota Actual</th>
              <th className="px-6 py-4 text-left">Observaciones</th>
              <th className="px-6 py-4 text-center">Promedio Anual</th>
              {!readOnly && <th className="px-6 py-4 text-center">Gestión</th>}
            </tr>
          </thead>
          <tbody>
            {matriculas.map((m: MatriculaConAlumno) => {
              const notaObj = notaMap.get(m.idMatricula);
              const valorNota = notaObj?.nota;
              const tieneNota = valorNota !== undefined && valorNota !== null;
              const aprobado = tieneNota && (valorNota ?? 0) >= 6;

              // Lógica de Promedio
              const n1 = getNotaTrimestre(m.idMatricula, "TRIMESTRE_1");
              const n2 = getNotaTrimestre(m.idMatricula, "TRIMESTRE_2");
              const n3 = getNotaTrimestre(m.idMatricula, "TRIMESTRE_3");
              const suma = n1 + n2 + n3;
              const promedioAnual = suma > 0 ? (suma / 3).toFixed(2) : null;
              const esPromocionado = suma >= 18 && n1 >= 6 && n2 >= 6 && n3 >= 6;

              // Lógica de "Recuperado "
              const tieneRecuperatorioAprobado = historialNotas.some((n: NotaWithPeriodo) =>
                n.idMatricula === m.idMatricula &&
                n.idPeriodo === idPeriodo &&
                n.tipo === "Recuperatorio" &&
                n.nota >= 6
              );

              // Lógica de Bloqueo
              const notaParcialActual = historialNotas.find((n: NotaWithPeriodo) =>
                n.idMatricula === m.idMatricula && n.idPeriodo === idPeriodo && n.tipo === "Parcial"
              );
              const yaAproboParcial = (notaParcialActual?.nota ?? 0) >= 6;
              const bloquearPorPromocion = esInstanciaDeCierre && esPromocionado;
              const bloquearRecuperatorio = tipo === "Recuperatorio" && yaAproboParcial;

              const estaBloqueado = bloquearPorPromocion || bloquearRecuperatorio || periodoCerrado;
              const isEditMode = (editando === m.idMatricula || !tieneNota) && !estaBloqueado;

              return (
                <tr key={m.idMatricula} className={`bg-white border shadow-sm rounded-2xl overflow-hidden transition-all ${estaBloqueado ? 'opacity-70' : 'hover:border-indigo-200'}`}>
                  {/* 1. ALUMNO */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${estaBloqueado ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-500'}`}>
                        {estaBloqueado ? <Lock size={16} /> : <User size={18} />}
                      </div>
                      <div>
                        <div className="font-black text-slate-700 text-sm uppercase leading-tight">{m.alumno.persona.apellido}, {m.alumno.persona.nombre}</div>
                        <div className="text-[10px] font-bold text-slate-400">LEGAJO: {m.alumno.legajo}</div>
                      </div>
                    </div>
                  </td>

                  {/* 2. NOTA ACTUAL (CON LOGICA DE RECUPERADO) */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {estaBloqueado ? (
                        <div className="flex flex-col items-center">
                          <Lock size={12} className="text-slate-300" />
                          <span className="text-[9px] font-black text-slate-400 uppercase">{bloquearRecuperatorio ? "Aprobado" : "Cerrado"}</span>
                        </div>
                      ) : isEditMode && !readOnly ? (
                        <input
                          form={`f-${m.idMatricula}`}
                          name="nota"
                          type="number"
                          min={1} max={10} step={0.5}
                          defaultValue={valorNota ?? ""}
                          className="w-20 text-center text-xl font-black bg-slate-100 border-2 border-indigo-100 rounded-xl py-2 focus:border-indigo-500 outline-none text-slate-900 placeholder-slate-700"
                        />
                      ) : (
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl text-xl font-black shadow-sm ${
                          !tieneNota ? 'bg-slate-50 text-slate-300' : aprobado ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {valorNota ?? "-"}
                        </div>
                      )}

                      {/* ETIQUETA INTELIGENTE (LA QUE TE GUSTABA) */}
                      {tieneNota && !aprobado && tipo === "Parcial" && !isEditMode && (
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md border ${
                          tieneRecuperatorioAprobado
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                        }`}>
                          {tieneRecuperatorioAprobado ? "Recuperado ✅" : "Debe recuperar ↩️"}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. OBSERVACIONES */}
                  <td className="px-6 py-4">
                    {isEditMode && !readOnly ? (
                      <input
                        form={`f-${m.idMatricula}`}
                        name="observacion"
                        defaultValue={notaObj?.observacion ?? ""}
                        placeholder="Comentarios..."
                        className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl py-2 px-4 text-xs outline-none focus:border-indigo-500 text-slate-900 placeholder-slate-700"
                      />
                    ) : (
                        <div className="text-xs text-slate-500 italic max-w-50 truncate">
                        {estaBloqueado ? (bloquearRecuperatorio ? "Aprobó instancia parcial." : "Periodo cerrado.") : (notaObj?.observacion || "Sin observaciones")}
                      </div>
                    )}
                  </td>

                  {/* 4. PROMEDIO */}
                  <td className="px-6 py-4 text-center bg-slate-50/30">
                    <div className="flex flex-col items-center">
                      <span className={`text-lg font-black ${esPromocionado ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {promedioAnual || "-"}
                      </span>
                      {promedioAnual && (
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                          esPromocionado ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {esPromocionado ? "Promocionado 🚀" : "A Diciembre 📝"}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 5. GESTIÓN */}
                  {!readOnly && (
                    <td className="px-6 py-4 text-center">
                      {estaBloqueado ? (
                        <CheckCircle2 size={20} className="mx-auto text-slate-300" />
                      ) : (
                        <form id={`f-${m.idMatricula}`} action={handleAction}>
                          <input type="hidden" name="idMatricula" value={m.idMatricula} />
                          <input type="hidden" name="idAsignacion" value={idAsignacion} />
                          <input type="hidden" name="idPeriodo" value={idPeriodo} />
                          <input type="hidden" name="tipo" value={tipo} />
                          {isEditMode ? (
                            <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-lg active:scale-95">
                              <Save size={18} />
                            </button>
                          ) : (
                            <button type="button" onClick={() => setEditando(m.idMatricula)} className="text-slate-300 hover:text-indigo-600 p-3">
                              <Edit2 size={18} />
                            </button>
                          )}
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}