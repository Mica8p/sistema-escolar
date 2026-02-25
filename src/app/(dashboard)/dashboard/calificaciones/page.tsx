import Link from "next/link";
import { auth } from "@/auth";
import { TipoEvaluacion } from "@prisma/client";
import { BookOpen, Calendar, GraduationCap, ClipboardCheck } from "lucide-react";
import {
  getAsignacionesParaUsuario,
  getPeriodosByCiclo,
  getPlanilla,
} from "@/service/calificaciones.service";
import CalificacionesTable from "@/components/modules/calificaciones/CalificacionesForm";
import { getCicloActual } from "@/lib/ciclo-session";
import CalificacionesSidebar from "@/components/modules/calificaciones/CalificacionesSidebar";

const TIPOS: TipoEvaluacion[] = ["Parcial", "Final", "Recuperatorio"];

export default async function CalificacionesPage({ searchParams }: { searchParams: Promise<{ asig?: string; periodo?: string; tipo?: string }> }) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const idCiclo = await getCicloActual();

  const isAdmin = session.user.roles.includes("ADMIN");
  const idPersona = session.user.idPersona ?? 0;

  const asignaciones = await getAsignacionesParaUsuario({ isAdmin, idPersona, idCiclo });

  const idAsignacion = params.asig ? Number(params.asig) : (asignaciones[0]?.idAsignacion || 0);
  const asigElegida = asignaciones.find((a) => a.idAsignacion === idAsignacion);

  const periodos = asigElegida ? await getPeriodosByCiclo(asigElegida.idCiclo) : [];
  const idPeriodo = params.periodo ? Number(params.periodo) : (periodos[0]?.idPeriodo || 0);

  const periodoElegido = periodos.find(p => p.idPeriodo === idPeriodo);

  const tipo = (params.tipo as TipoEvaluacion) ?? "Parcial";
  const tipoValido = TIPOS.includes(tipo) ? tipo : "Parcial";

  const planilla = (idAsignacion > 0 && idPeriodo > 0)
      ? await getPlanilla({ idAsignacion, idPeriodo, tipo: tipoValido })
      : null;

  const qs = (next: { asig?: number; periodo?: number; tipo?: TipoEvaluacion }) => {
    const p = new URLSearchParams();
    const finalAsig = next.asig ?? idAsignacion;
    const finalPeriodo = next.asig ? undefined : (next.periodo ?? idPeriodo);
    const finalTipo = next.tipo ?? tipoValido;

    if (finalAsig) p.set("asig", String(finalAsig));
    if (finalPeriodo) p.set("periodo", String(finalPeriodo));
    p.set("tipo", String(finalTipo));
    return `?${p.toString()}`;
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Carga de Calificaciones</h1>
          <p className="text-slate-500 text-sm">Gestioná las notas de tus alumnos por materia y trimestre.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
          <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Modo {isAdmin ? "Administrador" : "Docente"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. ASIGNACIÓN  */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center gap-2">
            <GraduationCap size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">1. Materia y Curso</span>
          </div>

          <CalificacionesSidebar
            asignaciones={asignaciones}
            idAsignacion={idAsignacion}
            idPeriodo={idPeriodo}
            tipo={tipoValido}
          />
        </div>

{/* 2. PERIODO LECTIVO */}
<div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
  <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center gap-2 shrink-0">
    <Calendar size={16} className="text-indigo-400" />
    <span className="text-[10px] font-black uppercase tracking-widest">2. Periodo Lectivo</span>
  </div>

  <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
    {periodos.length === 0 ? (
      <div className="py-12 text-center text-slate-400 italic text-[10px] uppercase font-black tracking-widest px-8">
        Seleccioná una materia primero para ver los trimestres.
      </div>
    ) : (
      periodos.map((p) => (
        <Link
          key={p.idPeriodo}
          href={qs({ periodo: p.idPeriodo })}
          className={`block w-full px-5 py-4 rounded-2xl border-2 transition-all ${
            p.idPeriodo === idPeriodo
              ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
              : "bg-white border-slate-50 text-slate-600 hover:border-indigo-100"
          }`}
        >
          <div className="font-black text-sm uppercase tracking-tight">
            {p.nombre.replace('_', ' ')}
          </div>
          <div className={`text-[10px] font-bold mt-1 ${p.idPeriodo === idPeriodo ? 'text-indigo-100' : 'text-slate-400'}`}>
            {new Date(p.fechaInicio).toLocaleDateString()} al {new Date(p.fechaFin).toLocaleDateString()}
          </div>
        </Link>
      ))
    )}
  </div>
</div>

        {/* 3. EVALUACIÓN */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-700 uppercase">3. Evaluación</span>
          </div>
          <div className="p-5 space-y-6">
            <div className="flex gap-2 flex-wrap">
              {TIPOS.map((t) => (
                <Link
                  key={t}
                  href={qs({ tipo: t })}
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                    t === tipoValido
                      ? "bg-slate-800 border-slate-800 text-white shadow-lg scale-105"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t.toUpperCase()}
                </Link>
              ))}
            </div>
            {asigElegida && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Materia:</span>
                  <span className="text-slate-700 font-bold">{asigElegida.materia.nombre}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Curso:</span>
                  <span className="text-slate-700 font-bold">{asigElegida.curso.grado}° {asigElegida.curso.seccion}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Ciclo:</span>
                  <span className="text-slate-700 font-bold">{asigElegida.ciclo.anio}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
        {/* CABECERA DE LA PLANILLA */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
              {planilla ? `Carga de Notas: ${asigElegida?.materia.nombre}` : "Planilla de Calificaciones"}
            </span>
          </div>
          {planilla && (
            <div className="text-[10px] font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
              {planilla.matriculas.length} ALUMNOS INSCRIPTOS
            </div>
          )}
        </div>

        {/* CONTENIDO DE LA PLANILLA */}
        <div className="min-h-[450px relative">
          {planilla ? (
            <div className="p-4 animate-in fade-in duration-500 text-gray-600">
              <CalificacionesTable
                idAsignacion={idAsignacion}
                idPeriodo={idPeriodo}
                periodoActual={periodoElegido}
                tipo={tipoValido}
                matriculas={planilla.matriculas}
                notaByMatricula={Array.from(planilla.notaByMatricula.entries())}
                readOnly={isAdmin}
                historialNotas={planilla.historialNotas}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-4 bg-slate-50/10">
              <div className="p-6 bg-white rounded-full border border-slate-100 shadow-inner">
                <ClipboardCheck size={48} className="text-slate-100" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-400 tracking-tight">Esperando selección académica</p>
                <p className="text-xs text-slate-300">Seleccioná una materia y un periodo para cargar alumnos.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}