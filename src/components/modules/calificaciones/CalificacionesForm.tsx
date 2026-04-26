"use client";

import { Nota } from "@prisma/client";
import { guardarNotaAction } from "@/lib/actions/calificaciones-actions";
import { Save, User, Edit2, Lock, CheckCircle2, Search, SaveAll, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  tipo: string;
  matriculas: MatriculaConAlumno[];
  notaByMatricula: Map<number, Nota>;
  readOnly?: boolean;
  historialNotas: NotaWithPeriodo[];
}

interface CambioNota {
  nota: number;
  observacion: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [cambios, setCambios] = useState<Map<number, CambioNota>>(new Map());
  const [guardando, setGuardando] = useState(false);
  const [guardandoIndividual, setGuardandoIndividual] = useState<number | null>(null);
  const [itemsPorMostrar, setItemsPorMostrar] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);
  const notaMap = new Map<number, Nota>(notaByMatricula);

  // Filtrar matriculas basado en searchTerm
  const filteredMatriculas = matriculas.filter(m => {
    if (!searchTerm) return true;
    const nombre = m.alumno.persona.nombre.toLowerCase();
    const apellido = m.alumno.persona.apellido.toLowerCase();
    const term = searchTerm.toLowerCase();
    return nombre.includes(term) || apellido.includes(term);
  });

  // 1. LÓGICA GLOBAL DE PERIODO
  const periodoCerrado = periodoActual?.cerrado;
  const nombrePeriodo = periodoActual?.nombre;
  const esInstanciaDeCierre = ["DICIEMBRE", "FEBRERO", "JULIO_PREVIAS"].includes(nombrePeriodo);

  const guardarIndividual = async (idMatricula: number, formData: FormData) => {
    const nota = Number(formData.get("nota"));
    const observacion = (formData.get("observacion") as string) || "";

    if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
      toast.error("La nota debe estar entre 0 y 10");
      return;
    }

    setGuardandoIndividual(idMatricula);

    try {
      const fd = new FormData();
      fd.set("idMatricula", String(idMatricula));
      fd.set("idAsignacion", String(idAsignacion));
      fd.set("idPeriodo", String(idPeriodo));
      fd.set("tipo", tipo);
      fd.set("nota", String(nota));
      fd.set("observacion", observacion);

      const res = await guardarNotaAction(fd);
      if (res.ok) {
        toast.success(`✅ Nota guardada para alumno`);
        setEditando(null);
        // Remover del mapa de cambios pendientes si existía
        const nuevosCambios = new Map(cambios);
        nuevosCambios.delete(idMatricula);
        setCambios(nuevosCambios);
        // Refrescar datos
        router.refresh();
      } else {
        toast.error(res.message || "Error al guardar");
      }
    } finally {
      setGuardandoIndividual(null);
    }
  };

  const guardarTodo = async () => {
    if (cambios.size === 0) {
      toast.info("No hay cambios pendientes para guardar");
      return;
    }

    setGuardando(true);
    let exitosos = 0;
    let errores = 0;

    for (const [idMatricula, { nota, observacion }] of cambios.entries()) {
      // Validar que la nota sea válida
      if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
        errores++;
        toast.error(`Nota inválida para alumno ${idMatricula}: debe estar entre 0 y 10`);
        continue; // Saltar este alumno
      }

      const formData = new FormData();
      formData.set("idMatricula", String(idMatricula));
      formData.set("idAsignacion", String(idAsignacion));
      formData.set("idPeriodo", String(idPeriodo));
      formData.set("tipo", tipo);
      formData.set("nota", String(nota));
      formData.set("observacion", observacion);

      try {
        const res = await guardarNotaAction(formData);
        if (res.ok) {
          exitosos++;
        } else {
          errores++;
          toast.error(`Error al guardar nota de alumno ${idMatricula}: ${res.message}`);
        }
      } catch {
        errores++;
        toast.error(`Error inesperado al guardar`);
      }
    }

    setGuardando(false);

    if (errores === 0 && exitosos > 0) {
      toast.success(`✅ ${exitosos} calificaciones guardadas exitosamente`);
      setCambios(new Map());
      // Usar router.refresh() para refrescar los datos del servidor
      router.refresh();
    } else if (exitosos > 0) {
      toast.error(`${exitosos} guardadas, ${errores} fallidas`);
    } else {
      toast.error(`No se guardó nada. Verifica que todas las notas sean válidas (0-10)`);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && itemsPorMostrar < filteredMatriculas.length) {
          setItemsPorMostrar((prev) => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [itemsPorMostrar, filteredMatriculas.length]);

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
      {/* CARTEL DE CAMBIOS SIN GUARDAR */}
      {cambios.size > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 px-4 py-3 rounded-2xl text-sm font-bold mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <span>{cambios.size} cambio(s) sin guardar</span>
          </div>
          <button
            onClick={guardarTodo}
            disabled={guardando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <SaveAll size={16} />
            {guardando ? "Guardando..." : "Guardar Todo"}
          </button>
        </div>
      )}

      {/* CARTEL DE CIERRE (ADMIN) */}
      {periodoCerrado && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase mb-6 w-fit mx-auto border border-amber-100 shadow-sm">
          <Lock size={14} className="text-amber-500" />
          Trimestre Cerrado por Administración
        </div>
      )}

      {/* BARRA DE BÚSQUEDA */}
      <div className="mb-4 flex justify-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por Apellido, Nombre o DNI..."
            className="peer block w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 text-slate-700 focus:ring-2 focus:ring-indigo-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
            <tr>
              <th className="px-6 py-4 text-left text-slate-700">Alumno</th>
              <th className="px-6 py-4 text-center text-slate-700">Nota Actual</th>
              <th className="px-6 py-4 text-left text-slate-700">Observaciones</th>
              <th className="px-6 py-4 text-center text-slate-700">Promedio Anual</th>
              {!readOnly && <th className="px-6 py-4 text-center">Gestión</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMatriculas.slice(0, itemsPorMostrar).map((m: MatriculaConAlumno) => {
              const notaObj = notaMap.get(m.idMatricula);
              const cambioLocal = cambios.get(m.idMatricula);
              const valorNota = cambioLocal?.nota ?? notaObj?.nota;
              const observacionActual = cambioLocal?.observacion ?? notaObj?.observacion;
              const tieneNota = valorNota !== undefined && valorNota !== null;
              const aprobado = tieneNota && (valorNota ?? 0) >= 6;
              const tieneCambioLocal = cambios.has(m.idMatricula);

              // ✅ Bloquear SOLO en instancias de recuperación (diciembre, febrero, julio)
              const esInstanciaDeRecuperacion = ["DICIEMBRE", "FEBRERO", "JULIO_PREVIAS"].includes(nombrePeriodo);

              // Lógica de Promedio
              const n1 = getNotaTrimestre(m.idMatricula, "TRIMESTRE_1");
              const n2 = getNotaTrimestre(m.idMatricula, "TRIMESTRE_2");
              const n3 = getNotaTrimestre(m.idMatricula, "TRIMESTRE_3");
              const suma = n1 + n2 + n3;
              const promedioAnual = suma > 0 ? (suma / 3).toFixed(2) : null;
              
              // ✅ Lógica de estado académico mejorada
              let esPromocionado = false;
              let estadoLabel = "A Diciembre 📝";
              const promGeneral = Number(promedioAnual) || 0;
              
              if (esInstanciaDeRecuperacion) {
                // Verificar si tiene derecho a estar en esta instancia
                let tieneDerechoAEstarAqui = false;
                
                if (nombrePeriodo === "DICIEMBRE") {
                  // Tiene derecho si promedio trimestral < 6
                  tieneDerechoAEstarAqui = promGeneral < 6;
                } else if (nombrePeriodo === "FEBRERO") {
                  // Tiene derecho si desaprobó en diciembre
                  const notaDiciembre = historialNotas.find((n: NotaWithPeriodo) =>
                    n.idMatricula === m.idMatricula &&
                    n.idAsignacion === idAsignacion &&
                    n.periodo.nombre === "DICIEMBRE"
                  );
                  tieneDerechoAEstarAqui = notaDiciembre ? (notaDiciembre.nota < 6) : false;
                } else if (nombrePeriodo === "JULIO_PREVIAS") {
                  // Tiene derecho si desaprobó en febrero
                  const notaFebrero = historialNotas.find((n: NotaWithPeriodo) =>
                    n.idMatricula === m.idMatricula &&
                    n.idAsignacion === idAsignacion &&
                    n.periodo.nombre === "FEBRERO"
                  );
                  tieneDerechoAEstarAqui = notaFebrero ? (notaFebrero.nota < 6) : false;
                }

                // Si NO tiene derecho a estar, mostrar promocionado
                if (!tieneDerechoAEstarAqui) {
                  esPromocionado = true;
                  estadoLabel = "Promocionado 🚀";
                } else {
                  // Si tiene derecho, verificar si ya tiene nota
                  const notaActualRecuperacion = historialNotas.find((n: NotaWithPeriodo) =>
                    n.idMatricula === m.idMatricula && n.idPeriodo === idPeriodo
                  );
                  
                  if (notaActualRecuperacion) {
                    if (notaActualRecuperacion.nota >= 6) {
                      esPromocionado = true;
                      estadoLabel = "Promocionado 🚀";
                    } else {
                      // Mostrar siguiente instancia según el período actual
                      if (nombrePeriodo === "DICIEMBRE") estadoLabel = "A Febrero 📝";
                      else if (nombrePeriodo === "FEBRERO") estadoLabel = "A Julio 📝";
                      else if (nombrePeriodo === "JULIO_PREVIAS") estadoLabel = "Desaprobado ❌";
                    }
                  } else {
                    // Sin nota aún, mostrar período actual
                    estadoLabel = "A " + nombrePeriodo + " 📝";
                  }
                }
              } else {
                // En trimestres: si promedio >= 6 → Promocionado; si < 6 → A Diciembre
                if (promGeneral >= 6) {
                  esPromocionado = true;
                  estadoLabel = "Promocionado 🚀";
                } else {
                  estadoLabel = "A Diciembre 📝";
                }
              }

              // Lógica de "Recuperado "
              const tieneRecuperatorioAprobado = historialNotas.some((n: NotaWithPeriodo) =>
                n.idMatricula === m.idMatricula &&
                n.idPeriodo === idPeriodo &&
                n.tipo === "Recuperatorio" &&
                n.nota >= 6
              );

              // Lógica de Bloqueo - CORRECTA
              const notaParcialActual = historialNotas.find((n: NotaWithPeriodo) =>
                n.idMatricula === m.idMatricula && n.idPeriodo === idPeriodo && n.tipo === "Parcial"
              );
              const tieneParcial = notaParcialActual !== undefined;
              const parcialMenorA6 = tieneParcial && (notaParcialActual.nota ?? 0) < 6;
              const bloquearPorPromocion = esInstanciaDeCierre && esPromocionado;
              const bloquearRecuperatorio = tipo === "Recuperatorio" && (!tieneParcial || !parcialMenorA6);

              // ✅ Bloquear según la instancia de recuperación
              let bloqueoPorRecuperacion = false;
              
              if (nombrePeriodo === "DICIEMBRE") {
                // Bloquear DICIEMBRE si promedio trimestral >= 6
                const promGeneral = Number(promedioAnual) || 0;
                bloqueoPorRecuperacion = promGeneral >= 6;
              } else if (nombrePeriodo === "FEBRERO") {
                // Bloquear FEBRERO si aprobó en diciembre
                const notaDiciembre = historialNotas.find((n: NotaWithPeriodo) =>
                  n.idMatricula === m.idMatricula &&
                  n.idAsignacion === idAsignacion &&
                  n.periodo.nombre === "DICIEMBRE"
                );
                bloqueoPorRecuperacion = notaDiciembre ? (notaDiciembre.nota >= 6) : false;
              } else if (nombrePeriodo === "JULIO_PREVIAS") {
                // Bloquear JULIO si aprobó en febrero
                const notaFebrero = historialNotas.find((n: NotaWithPeriodo) =>
                  n.idMatricula === m.idMatricula &&
                  n.idAsignacion === idAsignacion &&
                  n.periodo.nombre === "FEBRERO"
                );
                bloqueoPorRecuperacion = notaFebrero ? (notaFebrero.nota >= 6) : false;
              }

              const estaBloqueado = bloquearPorPromocion || bloquearRecuperatorio || periodoCerrado || bloqueoPorRecuperacion;
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
                          <span className="text-[9px] font-black text-slate-400 uppercase">{bloqueoPorRecuperacion ? "Ya Aprobó" : (bloquearRecuperatorio ? "Aprobado" : "Cerrado")}</span>
                        </div>
                      ) : isEditMode && !readOnly ? (
                        <input
                          form={`f-${m.idMatricula}`}
                          name="nota"
                          type="number"
                          min={1} max={10} step={0.5}
                          defaultValue={cambioLocal?.nota ?? valorNota ?? ""}
                          className="w-20 text-center text-xl font-black bg-slate-100 border-2 border-indigo-100 rounded-xl py-2 focus:border-indigo-500 outline-none text-slate-900 placeholder-slate-700"
                        />
                      ) : (
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl text-xl font-black shadow-sm ${
                          !tieneNota ? 'bg-slate-50 text-slate-300' : aprobado ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        } ${tieneCambioLocal ? 'ring-2 ring-blue-400' : ''}`}>
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
                        defaultValue={cambioLocal?.observacion ?? notaObj?.observacion ?? ""}
                        placeholder="Comentarios..."
                        className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl py-2 px-4 text-xs outline-none focus:border-indigo-500 text-slate-900 placeholder-slate-700"
                      />
                    ) : (
                        <div className="text-xs text-slate-500 italic max-w-50 truncate">
                        {estaBloqueado ? (bloqueoPorRecuperacion ? "Ya tiene nota aprobatoria." : (bloquearRecuperatorio ? "Aprobó instancia parcial." : "Periodo cerrado.")) : (observacionActual || "Sin observaciones")}
                      </div>
                    )}
                  </td>

                  {/* 4. PROMEDIO O NOTA DEL PERIODO */}
                  <td className="px-6 py-4 text-center bg-slate-50/30">
                    <div className="flex flex-col items-center">
                      <span className={`text-lg font-black ${esPromocionado ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {esInstanciaDeRecuperacion ? (valorNota || "-") : (promedioAnual || "-")}
                      </span>
                      {(esInstanciaDeRecuperacion ? valorNota : promedioAnual) && (
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                          esPromocionado ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {estadoLabel}
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
                        <form id={`f-${m.idMatricula}`}>
                          <input type="hidden" name="idMatricula" value={m.idMatricula} />
                          <input type="hidden" name="idAsignacion" value={idAsignacion} />
                          <input type="hidden" name="idPeriodo" value={idPeriodo} />
                          <input type="hidden" name="tipo" value={tipo} />
                          {isEditMode ? (
                            <button type="button" onClick={() => {
                              const form = document.getElementById(`f-${m.idMatricula}`) as HTMLFormElement;
                              const formData = new FormData(form);
                              guardarIndividual(m.idMatricula, formData);
                            }} disabled={guardandoIndividual === m.idMatricula} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
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

      {/* INFINITE SCROLL TRIGGER */}
      <div ref={observerTarget} className="flex justify-center py-4">
        {itemsPorMostrar < filteredMatriculas.length && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <ChevronDown size={16} className="animate-bounce" />
            Cargando más...
          </div>
        )}
      </div>
    </div>
  );
}