import { auth } from "@/auth";
import { Users, Clock, CheckCircle } from "lucide-react";
import { getAsignacionesParaUsuario } from "@/service/calificaciones.service";
import { getHorariosByAsignaciones, getPlanillaAsistencia } from "@/service/asistencias.service";
import AsistenciasTable from "@/components/modules/asistencias/AsistenciasTable";
import { getCicloActual } from "@/lib/ciclo-session";
import AsistenciasHeader from "./AsistenciasHeader"; // IMPORTAMOS EL NUEVO COMPONENTE
import { Materia } from "@prisma/client";

export default async function AsistenciasPage({
  searchParams
}: {
  searchParams: Promise<{ mat?: string; horario?: string; fecha?: string }>
}) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const idCiclo = await getCicloActual();
  const isAdmin = session.user.roles.includes("ADMIN");
  const idPersona = session.user.idPersona ?? 0;

  const asignaciones = await getAsignacionesParaUsuario({ isAdmin, idPersona, idCiclo });

  const materiasUnicas = asignaciones.reduce((acc, a) => {
    if (!acc.find(m => m.idMateria === a.materia.idMateria)) {
      acc.push(a.materia);
    }
    return acc;
  }, [] as Materia[]);


  // 1. GESTIÓN DE FECHAS (Server Side)
  const hoy = new Date();
  const hoyISO = hoy.toISOString().split('T')[0];
  const fechaSeleccionada = params.fecha ? new Date(params.fecha + 'T12:00:00') : hoy;
  const fechaISO = fechaSeleccionada.toISOString().split('T')[0];

  const diasMapping = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
  const nombreDiaSeleccionado = diasMapping[fechaSeleccionada.getDay()];

  // 2. SELECCIÓN Y FILTRADO
  const idMateria = params.mat ? Number(params.mat) : (materiasUnicas[0]?.idMateria || 0);
  const asignacionesDeMateria = asignaciones.filter(a => a.materia.idMateria === idMateria);
  const idsAsignaciones = asignacionesDeMateria.map(a => a.idAsignacion);

  const horariosRaw = await getHorariosByAsignaciones(idsAsignaciones);
  const horariosFiltrados = horariosRaw.filter(h => h.diaSemana === nombreDiaSeleccionado);

  const horariosUnicos = horariosFiltrados.reduce((acc, h) => {
    if (!acc.find(i => i.idAsignacion === h.idAsignacion)) {
      acc.push(h);
    }
    return acc;
  }, [] as typeof horariosFiltrados);

  const idHorario = params.horario ? Number(params.horario) : (horariosUnicos[0]?.idHorario || 0);
  const horarioElegido = horariosFiltrados.find(h => h.idHorario === idHorario);
  
  const idAsignacion = horarioElegido?.idAsignacion || 0;
  const asigElegida = asignaciones.find((a) => a.idAsignacion === idAsignacion);


  const planilla = (idAsignacion > 0 && idHorario > 0)
    ? await getPlanillaAsistencia({ idAsignacion, idHorario, fecha: fechaSeleccionada })
    : null;

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">

      {/* HEADER DINÁMICO (CLIENT COMPONENT) */}
      <AsistenciasHeader
        fechaISO={fechaISO}
        hoyISO={hoyISO}
        idAsignacion={idAsignacion}
        nombreDia={nombreDiaSeleccionado}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA 1: MATERIA */}
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

        {/* COLUMNA 2: HORARIO FILTRADO */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-800 text-white flex items-center gap-2">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">2. Bloques del {nombreDiaSeleccionado}</span>
          </div>
          <div className="p-4 space-y-2">
            {horariosUnicos.length === 0 ? (
              <div className="py-20 text-center text-slate-300 italic text-xs px-6">
                No hay clases registradas para el día {nombreDiaSeleccionado.toLowerCase()}.
              </div>
            ) : (
              horariosUnicos.map((h) => {
                const asig = asignaciones.find(a => a.idAsignacion === h.idAsignacion);
                return (
                <a
                  key={h.idHorario}
                  href={`?mat=${idMateria}&horario=${h.idHorario}&fecha=${fechaISO}`}
                  className={`block px-4 py-4 rounded-2xl border-2 transition-all ${
                    h.idHorario === idHorario
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                      : "bg-white border-slate-50 hover:border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="font-black text-sm uppercase">{asig?.curso.grado}° {asig?.curso.seccion}</div>
                  <div className={`text-[10px] font-bold ${h.idHorario === idHorario ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {h.horaInicio} a {h.horaFin} hs.
                  </div>
                </a>
              )})
            )}
          </div>
        </div>

        {/* COLUMNA 3: RESUMEN */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-800 text-white flex items-center gap-2">
            <CheckCircle size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">3. Resumen</span>
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
                    <span className="text-[10px] font-black text-slate-400 uppercase">Fecha</span>
                    <span className="text-sm font-bold text-slate-700">{fechaISO}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                    <div className="text-2xl font-black text-emerald-600">--</div>
                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Presentes</div>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                    <div className="text-2xl font-black text-rose-600">--</div>
                    <div className="text-[9px] font-black text-rose-600 uppercase tracking-tighter">Ausentes</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 italic text-xs">Esperando selección...</div>
            )}
          </div>
        </div>
      </div>

      {/* PLANILLA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px">
        {planilla ? (
          <div className="p-4">
             <AsistenciasTable
              idAsignacion={idAsignacion}
              idHorario={idHorario}
              fecha={fechaISO}
              matriculas={planilla.matriculas}
              asistenciaByMatricula={Array.from(planilla.asistenciaByMatricula.entries())}
              readOnly={isAdmin}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px text-slate-300 gap-4">
            <Users size={64} className="opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Seleccioná un bloque horario</p>
          </div>
        )}
      </div>
    </div>
  );
}