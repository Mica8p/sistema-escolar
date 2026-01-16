import { auth } from "@/auth";
import {
  Users,
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { getAsignacionesParaUsuario } from "@/service/calificaciones.service";
import { getHorariosByAsignacion, getPlanillaAsistencia } from "@/service/asistencias.service";
import AsistenciasTable from "@/components/modules/asistencias/AsistenciasTable";

export default async function AsistenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ asig?: string; horario?: string; fecha?: string }>;
}) {
  const params = await searchParams; // Unwrapping para Next.js 16

  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const isAdmin = session.user.roles.includes("ADMIN");
  const idPersona = session.user.idPersona ?? 0;

  // 1. Traer materias asignadas
  const asignaciones = await getAsignacionesParaUsuario({ isAdmin, idPersona });

  // Lógica de Selección
  const idAsignacion = params.asig ? Number(params.asig) : (asignaciones[0]?.idAsignacion || 0);
  const asigElegida = asignaciones.find((a) => a.idAsignacion === idAsignacion);

  // 2. Traer horarios de la materia elegida
  const horarios = asigElegida ? await getHorariosByAsignacion(idAsignacion) : [];
  const idHorario = params.horario ? Number(params.horario) : (horarios[0]?.idHorario || 0);
  const horarioElegido = horarios.find(h => h.idHorario === idHorario);

  // 3. Manejo de Fecha (Por defecto HOY: 15/01/2026)
  const fechaSeleccionada = params.fecha ? new Date(params.fecha) : new Date();
  const fechaISO = fechaSeleccionada.toISOString().split('T')[0];

  // 4. Traer la planilla si tenemos todo
  const planilla = (idAsignacion > 0 && idHorario > 0)
    ? await getPlanillaAsistencia({ idAsignacion, idHorario, fecha: fechaSeleccionada })
    : null;

  // Helper para URLs dinámicas
  const getUrl = (next: { asig?: number; horario?: number; fecha?: string }) => {
    const p = new URLSearchParams();
    p.set("asig", String(next.asig ?? idAsignacion));
    p.set("horario", String(next.asig ? (horarios[0]?.idHorario || "") : (next.horario ?? idHorario)));
    p.set("fecha", next.fecha ?? fechaISO);
    return `?${p.toString()}`;
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* HEADER PROFESIONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">CONTROL DE ASISTENCIAS</h1>
          <p className="text-slate-500 text-sm font-medium">Registro diario de presencia por materia y horario.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <CalendarIcon size={20} className="text-indigo-600" />
          <input
            type="date"
            defaultValue={fechaISO}
            className="text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            // Aquí podrías agregar un cliente-side redirect para cambiar la fecha
          />
        </div>
      </div>

      {/* PANEL DE 3 COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA 1: MATERIA */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-800 text-white flex items-center gap-2">
            <Users size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">1. Seleccionar Materia</span>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto max-h-[300px">
            {asignaciones.map((a) => (
              <a
                key={a.idAsignacion}
                href={getUrl({ asig: a.idAsignacion })}
                className={`block px-4 py-4 rounded-2xl border-2 transition-all ${
                  a.idAsignacion === idAsignacion
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                    : "bg-white border-slate-50 hover:border-slate-200 text-slate-600"
                }`}
              >
                <div className="font-black text-sm uppercase">{a.materia.nombre}</div>
                <div className={`text-[10px] font-bold ${a.idAsignacion === idAsignacion ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {a.curso.grado}° {a.curso.seccion} • {a.curso.nivel}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* COLUMNA 2: HORARIO DE CLASE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-800 text-white flex items-center gap-2">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">2. Horario de la Clase</span>
          </div>
          <div className="p-4 space-y-2">
            {horarios.length === 0 ? (
              <div className="py-20 text-center text-slate-300 italic text-xs">Seleccioná una materia.</div>
            ) : (
              horarios.map((h) => (
                <a
                  key={h.idHorario}
                  href={getUrl({ horario: h.idHorario })}
                  className={`block px-4 py-4 rounded-2xl border-2 transition-all ${
                    h.idHorario === idHorario
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                      : "bg-white border-slate-50 hover:border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="font-black text-sm uppercase">{h.diaSemana}</div>
                  <div className={`text-[10px] font-bold ${h.idHorario === idHorario ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {new Date(h.horaInicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} a {new Date(h.horaFin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 3: ESTADO / RESUMEN */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-800 text-white flex items-center gap-2">
            <CheckCircle size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">3. Resumen del Día</span>
          </div>
          <div className="p-6">
            {asigElegida && horarioElegido ? (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Materia</span>
                    <span className="text-sm font-bold text-slate-700">{asigElegida.materia.nombre}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Día</span>
                    <span className="text-sm font-bold text-slate-700">{horarioElegido.diaSemana}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                    <div className="text-2xl font-black text-emerald-600">--</div>
                    <div className="text-[9px] font-black text-emerald-600 uppercase">Presentes</div>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                    <div className="text-2xl font-black text-rose-600">--</div>
                    <div className="text-[9px] font-black text-rose-600 uppercase">Ausentes</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 italic text-xs">Esperando selección...</div>
            )}
          </div>
        </div>
      </div>

      {/* PLANILLA DE ALUMNOS (RESULTADO) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px">
        {planilla ? (
          <div className="p-4">
             <AsistenciasTable
              idAsignacion={idAsignacion}
              idHorario={idHorario}
              fecha={fechaISO}
              matriculas={planilla.matriculas}
              asistenciaByMatricula={Array.from(planilla.asistenciaByMatricula.entries())}
              readOnly={isAdmin} //
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px text-slate-300 gap-4">
            <div className="p-10 bg-slate-50 rounded-full border border-slate-100 animate-pulse">
              <Users size={64} className="text-slate-200" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Planilla de Asistencia Vacía</p>
              <p className="text-xs text-slate-300 font-medium">Seleccioná los 3 filtros de arriba para pasar lista.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}