'use client'

import { Users, Clock, CheckCircle, CalendarDays } from "lucide-react";
import AsistenciasHeader from "./AsistenciasHeader";
import { Materia, EstadoAsistencia } from "@prisma/client";
import { useState, useMemo, useEffect } from "react";
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
}: any) {
  const [asistenciaMap, setAsistenciaMap] = useState(new Map<number, any>());

  useEffect(() => {
    if (planilla?.asistenciaByMatricula) {
      setAsistenciaMap(new Map(planilla.asistenciaByMatricula));
    }
  }, [planilla]);

  // 🚩 LÓGICA AMPLIADA: Ahora contamos los 4 estados posibles
  const { presentes, ausentes, tardes, justificados } = useMemo(() => {
    let p = 0, a = 0, t = 0, j = 0;
    asistenciaMap.forEach((reg) => {
      if (reg.estado === "Presente") p++;
      else if (reg.estado === "Ausente") a++;
      else if (reg.estado === "Tarde") t++;
      else if (reg.estado === "Justificado") j++;
    });
    return { presentes: p, ausentes: a, tardes: t, justificados: j };
  }, [asistenciaMap]);

  const handleAsistenciaChange = (idMatricula: number, nuevoEstado: EstadoAsistencia) => {
    setAsistenciaMap(prev => {
      const newMap = new Map(prev);
      const reg = newMap.get(idMatricula);
      newMap.set(idMatricula, { ...reg, idMatricula, estado: nuevoEstado });
      return newMap;
    });
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <AsistenciasHeader fechaISO={fechaISO} hoyISO={hoyISO} idAsignacion={idAsignacion} nombreDia={nombreDiaSeleccionado} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL 1: MATERIA */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2">
            <Users size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">1. Materia</span>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto max-h-[400px]">
            {materiasUnicas.map((m: any) => (
              <a key={m.idMateria} href={`?mat=${m.idMateria}&fecha=${fechaISO}`} className={`block px-5 py-4 rounded-2xl border-2 transition-all ${m.idMateria === idMateria ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-white border-slate-50 text-slate-600 hover:border-slate-200"}`}>
                <div className="font-black text-sm uppercase tracking-tight">{m.nombre}</div>
              </a>
            ))}
          </div>
        </div>

        {/* PANEL 2: BLOQUES */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2">
            <Clock size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">2. Bloques del {nombreDiaSeleccionado}</span>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(horariosPorCurso || {}).map(([idCursoStr, horarios]: any) => {
              const cursoAsig = asignaciones.find((a: any) => a.idCurso === Number(idCursoStr) && a.materia.idMateria === idMateria);
              if (!cursoAsig) return null;
              const isSelected = horarios.some((h: any) => h.idHorario === idHorario);
              return (
                <a key={idCursoStr} href={`?mat=${idMateria}&horario=${horarios[0].idHorario}&fecha=${fechaISO}`} className={`block px-5 py-4 rounded-2xl border-2 transition-all ${isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-white border-slate-50 text-slate-600 hover:border-slate-200"}`}>
                  <div className="font-black text-sm uppercase tracking-tight">{cursoAsig.curso.grado}° {cursoAsig.curso.seccion}</div>
                  <div className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {horarios.map((h: any) => `${h.horaInicio.slice(0,5)} a ${h.horaFin.slice(0,5)}`).join(' - ')}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* 🚩 PANEL 3: RESUMEN DETALLADO (DISEÑO MEJORADO) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2">
            <CheckCircle size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">3. Resumen de Clase</span>
          </div>
          <div className="p-6 h-full flex flex-col justify-between">
            {planilla ? (
              <div className="space-y-6">
                <div className="text-center border-b border-slate-100 pb-4">
                   <div className="text-sm font-black text-slate-800 uppercase tracking-tighter">{asig?.materia?.nombre}</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center justify-center gap-2">
                     <CalendarDays size={12} /> {new Date(fechaISO + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                   </div>
                </div>

                {/* GRILLA DE 4 ESTADOS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-center">
                    <div className="text-2xl font-black text-emerald-600">{presentes}</div>
                    <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Presentes</div>
                  </div>
                  <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 text-center">
                    <div className="text-2xl font-black text-rose-600">{ausentes}</div>
                    <div className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Ausentes</div>
                  </div>
                  <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 text-center">
                    <div className="text-2xl font-black text-amber-500">{tardes}</div>
                    <div className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Tardes</div>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-200 text-center">
                    <div className="text-2xl font-black text-slate-500">{justificados}</div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Justificados</div>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Total alumnos: {asistenciaMap.size}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 italic py-10">
                <p className="text-xs font-black uppercase tracking-widest">Esperando selección...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[500px]">
        {planilla ? (
          <div className="p-6">
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
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-300 gap-4 uppercase font-black text-[10px] tracking-widest">
            <Users size={48} className="opacity-10 mb-2" />
            Elegí una materia y curso para pasar lista
          </div>
        )}
      </div>
    </div>
  );
}