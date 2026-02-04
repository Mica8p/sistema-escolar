'use client'

import { Users, Clock, CheckCircle } from "lucide-react";
import AsistenciasHeader from "./AsistenciasHeader";
import { Materia, EstadoAsistencia } from "@prisma/client";
import { useState, useMemo } from "react";
import AsistenciasTable from "@/components/modules/asistencias/AsistenciasTable";

export default function AsistenciasClient({
  asig,
  materiasUnicas,
  idMateria,
  fechaISO,
  hoyISO,
  idAsignacion,
  nombreDiaSeleccionado,
  horariosPorCurso,
  asignaciones,
  idHorario,
  planilla,
  isAdmin
}) {
  const [asistenciaMap, setAsistenciaMap] = useState(new Map<number, any>(planilla?.asistenciaByMatricula || []));

  const { presentes, ausentes } = useMemo(() => {
    let presentes = 0;
    let ausentes = 0;
    if (planilla) {
      for (const registro of asistenciaMap.values()) {
        if (registro.estado === "Presente") presentes++;
        if (registro.estado === "Ausente") ausentes++;
      }
    }
    return { presentes, ausentes };
  }, [asistenciaMap, planilla]);

  const handleAsistenciaChange = (idMatricula: number, nuevoEstado: EstadoAsistencia) => {
    setAsistenciaMap(prevMap => {
      const newMap = new Map(prevMap);
      const registroExistente = newMap.get(idMatricula);
      newMap.set(idMatricula, { ...registroExistente, idMatricula, estado: nuevoEstado });
      return newMap;
    });
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <AsistenciasHeader
        fechaISO={fechaISO}
        hoyISO={hoyISO}
        idAsignacion={idAsignacion}
        nombreDia={nombreDiaSeleccionado}
      />

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center gap-2">
              <Users size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">1. Materia</span>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto max-h-[400px">
              {materiasUnicas.map((m) => (
                <a
                  key={m.idMateria}
                  href={`?mat=${m.idMateria}&fecha=${fechaISO}`}
                  className={`block px-4 py-4 rounded-2xl border-2 transition-all ${
                    m.idMateria === idMateria
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                      : "bg-white border-slate-50 hover:border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="font-black text-sm uppercase">{m.nombre}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center gap-2">
              <Clock size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">2. Bloques del {nombreDiaSeleccionado}</span>
            </div>
            <div className="p-4 space-y-2">
              {Object.keys(horariosPorCurso || {}).length === 0 ? (
                <div className="py-20 text-center text-slate-300 italic text-xs px-6">
                  No hay clases registradas para el día {nombreDiaSeleccionado.toLowerCase()}.
                </div>
              ) : (
                Object.entries(horariosPorCurso || {}).map(([idCursoStr, horarios]) => {
                  const idCurso = Number(idCursoStr);
                  // Buscamos la asignación usando el Curso y la Materia seleccionada
                  const asig = asignaciones.find(a => a.idCurso === idCurso && a.materia.idMateria === idMateria);
                  if (!asig) return null;

                  // Ordenamos y mostramos los horarios
                  const horariosOrdenados = [...horarios].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
                  const horariosStr = horariosOrdenados.map(h => `${h.horaInicio.slice(0, 5)}`).join(' - ');
                  const primerHorario = horariosOrdenados[0];
                  
                  // Está seleccionado si ALGUNO de los horarios de este bloque coincide con el idHorario seleccionado
                  const isSelected = horarios.some(h => h.idHorario === idHorario);

                  return (
                    <a
                      key={idCurso}
                      href={`?mat=${idMateria}&horario=${primerHorario.idHorario}&fecha=${fechaISO}`}
                      className={`block px-4 py-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                          : "bg-white border-slate-50 hover:border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="font-black text-sm uppercase">{asig.curso.grado}° {asig.curso.seccion}</div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{asig.materia.nombre}</div>
                      <div className={`text-[10px] font-bold mt-2 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>{horariosStr}</div>
                    </a>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center gap-2">
              <CheckCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">3. Resumen</span>
            </div>
            <div className="p-6">
              {planilla?.asig && (
                <div className="space-y-6">
                  <div className="text-center border-b border-slate-100 pb-4">
                    <div className="text-lg font-black text-slate-700 uppercase">
                      {materiasUnicas.find((m) => m.idMateria === idMateria)?.nombre}
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase mt-1">
                      {new Date(fechaISO + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                      <div className="text-2xl font-black text-emerald-600">{presentes}</div>
                      <div className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Presentes</div>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                      <div className="text-2xl font-black text-rose-600">{ausentes}</div>
                      <div className="text-[9px] font-black text-rose-600 uppercase tracking-tighter">Ausentes</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
          {planilla ? (
            <div className="p-4">
              <AsistenciasTable
                idAsignacion={idAsignacion}
                idHorario={idHorario}
                fecha={fechaISO}
                matriculas={planilla.matriculas}
                asistenciaByMatricula={Array.from(asistenciaMap.entries())}
                readOnly={isAdmin}
                onAsistenciaChange={handleAsistenciaChange}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-slate-300 gap-4">
              <Users size={64} className="opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Seleccioná un bloque horario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
