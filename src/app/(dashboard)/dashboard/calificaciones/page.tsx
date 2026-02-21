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

const TIPOS: TipoEvaluacion[] = ["Parcial", "Final", "Recuperatorio"];

export default async function CalificacionesPage({ searchParams }: { searchParams: Promise<{ asig?: string; periodo?: string; tipo?: string }> }) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  // 1. OBTENER EL CICLO DESDE LA COOKIE
  const idCiclo = await getCicloActual();

  const isAdmin = session.user.roles.includes("ADMIN");
  const idPersona = session.user.idPersona ?? 0;

  // 2. PASAR EL ID DEL CICLO AL SERVICIO
  const asignaciones = await getAsignacionesParaUsuario({ isAdmin, idPersona, idCiclo });

  // Lógica de IDs para filtros
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

  // Helper para construir la URL de los botones
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

      {/* FILTROS SUPERIORES (1, 2, 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. ASIGNACIÓN */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <GraduationCap size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-700 uppercase">1. Materia y Curso</span>
          </div>
          <div className="p-3 flex flex-col gap-2 max-h-[320px overflow-y-auto">
            {asignaciones.map((a) => (
              <Link
              key={a.idAsignacion}
              href={qs({ asig: a.idAsignacion })}
              className={`px-4 py-3 rounded-xl border transition-all ${
                a.idAsignacion === idAsignacion
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white border-slate-100 hover:border-indigo-200 text-slate-600 hover:bg-indigo-50/30"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className={`font-bold text-sm ${a.idAsignacion === idAsignacion ? 'text-white' : 'text-slate-800'}`}>
                  {a.materia.nombre}
                </div>

                <div className="flex items-center gap-2">
                  {/* Badge de Turno para diferenciar secciones duplicadas */}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                    a.idAsignacion === idAsignacion
                      ? "bg-white/20 text-white" // Estilo cuando la tarjeta está seleccionada
                      : a.curso.turno === 'Mañana'
                        ? "bg-orange-100 text-orange-700" // Estilo para Mañana
                        : "bg-blue-100 text-blue-700"    // Estilo para Tarde
                  }`}>
                    {a.curso.turno}
                  </span>

                    <div className={`text-[11px] font-medium ${a.idAsignacion === idAsignacion ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {a.curso.grado}° {a.curso.seccion} • {a.curso.nivel}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 2. PERIODO */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Calendar size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-700 uppercase">2. Periodo Lectivo</span>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {periodos.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic text-xs">
                Seleccioná una materia primero.
              </div>
            ) : (
              periodos.map((p) => (
                <Link
                  key={p.idPeriodo}
                  href={qs({ periodo: p.idPeriodo })}
                  className={`px-4 py-3 rounded-xl border transition-all ${
                    p.idPeriodo === idPeriodo
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "bg-white border-slate-100 hover:border-indigo-200 text-slate-600 hover:bg-indigo-50/30"
                  }`}
                >
                  <div className="font-bold text-sm">{p.nombre.replace('_', ' ')}</div>
                  <div className={`text-[11px] font-medium ${p.idPeriodo === idPeriodo ? 'text-indigo-100' : 'text-slate-400'}`}>
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

      {/* SECCIÓN DE LA PLANILLA (CORREGIDA PARA MEJOR CONTRASTE) */}
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