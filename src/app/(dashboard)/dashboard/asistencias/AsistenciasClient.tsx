'use client'

import { Users, Clock, CheckCircle, CalendarDays, GraduationCap, Search } from "lucide-react";
import AsistenciasHeader from "./AsistenciasHeader";
import { Materia, EstadoAsistencia, AsignacionAcademica, Alumno, Persona, Turno } from "@prisma/client";
import { useState, useMemo, useEffect } from "react";
import AsistenciasTable from "@/components/modules/asistencias/AsistenciasTable";
import PaginationControls from "@/components/shared/PaginationControls";
import { useRouter, useSearchParams } from "next/navigation";

type AsistenciaMap = Map<number, {
    idMatricula: number;
    estado: EstadoAsistencia;
}>;

interface Matricula {
    idMatricula: number;
    alumno: Alumno & { persona: Persona };
}

interface Planilla {
    asig: AsignacionAcademica & { materia: Materia };
    matriculas: Matricula[];
    asistenciaByMatricula: [number, {
        idMatricula: number;
        estado: EstadoAsistencia;
    }][];
    totalMatriculas: number;
}

interface CursoAgrupado {
  idCurso: number;
  grado: string;
  seccion: string;
  turnos: Turno[];
}

interface Props {
  asig?: AsignacionAcademica & { materia: Materia };
  cursos: CursoAgrupado[];
  idCurso: number;
  turno: Turno;
  materiasUnicas: Materia[];
  idMateria: number;
  fechaISO: string;
  hoyISO: string;
  idAsignacion: number;
  nombreDiaSeleccionado: string;
  idHorario: number;
  planilla: Planilla | null;
  isAdmin: boolean;
  currentPage: number;
  totalPages: number;
  search?: string;
}

export default function AsistenciasClient({
  asig,
  cursos,
  idCurso,
  turno,
  materiasUnicas,
  idMateria,
  fechaISO,
  hoyISO,
  idAsignacion,
  nombreDiaSeleccionado,
  idHorario,
  planilla,
  isAdmin,
  currentPage,
  totalPages,
  search,
}: Props) {
  const [asistenciaMap, setAsistenciaMap] = useState<AsistenciaMap>(new Map());
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (planilla?.asistenciaByMatricula) {
      setAsistenciaMap(new Map(planilla.asistenciaByMatricula));
    }
  }, [planilla]);

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

  const turnosDelCurso = cursos.find(c => c.idCurso === idCurso)?.turnos || [];

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <AsistenciasHeader fechaISO={fechaISO} hoyISO={hoyISO} idAsignacion={idAsignacion} nombreDia={nombreDiaSeleccionado} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* PANEL 1: CURSO */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2 shrink-0">
            <GraduationCap size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">1. Curso</span>
          </div>

          <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
            {cursos.map((c) => (
              <a
                key={c.idCurso}
                href={`?curso=${c.idCurso}&fecha=${fechaISO}`}
                className={`block px-5 py-4 rounded-2xl border-2 transition-all ${
                  c.idCurso === idCurso
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
                    : "bg-white border-slate-50 text-slate-600 hover:border-slate-200"
                }`}
              >
                <div className="font-black text-sm uppercase tracking-tight">{c.grado}° {c.seccion}</div>
              </a>
            ))}
          </div>
        </div>

        {/* PANEL 2: TURNO */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2 shrink-0">
              <Clock size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">2. Turno</span>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
              {turnosDelCurso.map((t) => (
                <a
                  key={t}
                  href={`?curso=${idCurso}&turno=${t}&fecha=${fechaISO}`}
                  className={`block px-5 py-4 rounded-2xl border-2 transition-all ${
                    t === turno
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
                      : "bg-white border-slate-50 text-slate-600 hover:border-slate-200"
                  }`}
                >
                  <div className="font-black text-sm uppercase tracking-tight">{t}</div>
                </a>
              ))}
            </div>
        </div>
        
        {/* PANEL 3: MATERIA */}
       <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2 shrink-0">
            <Users size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">3. Materia</span>
          </div>

          <div className="p-4 border-b border-slate-50 bg-slate-50/30">
            <input
              type="text"
              placeholder="🔍 Buscar materia..."
              onChange={(e) => router.push(`?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), mat_search: e.target.value })}`)}
              className="w-full text-[10px] font-black uppercase p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all text-slate-700 placeholder:text-slate-300"
            />
          </div>

          <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
            {materiasUnicas.length > 0 ? (
              materiasUnicas.map((m) => (
                <a
                  key={m.idMateria}
                  href={`?curso=${idCurso}&turno=${turno}&mat=${m.idMateria}&fecha=${fechaISO}`}
                  className={`block px-5 py-4 rounded-2xl border-2 transition-all ${
                    m.idMateria === idMateria
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
                      : "bg-white border-slate-50 text-slate-600 hover:border-slate-200"
                  }`}
                >
                  <div className="font-black text-sm uppercase tracking-tight">{m.nombre}</div>
                </a>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-[10px] font-bold uppercase italic">
                No se encontraron materias
              </div>
            )}
          </div>
        </div>

        {/*  PANEL 4: RESUMEN DETALLADO */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2">
            <CheckCircle size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">4. Resumen de Clase</span>
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
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Total alumnos: {planilla.totalMatriculas}</p>
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
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
              {planilla ? `Listado de Alumnos` : "Seleccione los filtros"}
            </span>
          </div>
          {planilla && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por Apellido o DNI..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                onChange={(e) => handleSearchChange(e.target.value)}
                defaultValue={search}
              />
            </div>
          )}
        </div>
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
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
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