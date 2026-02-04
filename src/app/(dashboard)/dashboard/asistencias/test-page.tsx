import { auth } from "@/auth";
import { Users, Clock } from "lucide-react";
import { getAsignacionesParaUsuario } from "@/service/calificaciones.service";
import { getHorariosByAsignaciones, getPlanillaAsistencia } from "@/service/asistencias.service";
import AsistenciaView from "./AsistenciaView";
import { getCicloActual } from "@/lib/ciclo-session";
import AsistenciasHeader from "./AsistenciasHeader";
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

  const horariosPorAsignacion = horariosFiltrados.reduce((acc, h) => {
    const key = h.idAsignacion;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(h);
    return acc;
  }, {} as Record<number, typeof horariosFiltrados>);

  const idHorario = params.horario ? Number(params.horario) : (horariosFiltrados[0]?.idHorario || 0);
  const horarioElegido = horariosFiltrados.find(h => h.idHorario === idHorario);

  const idAsignacion = horarioElegido?.idAsignacion || 0;


  const planilla = (idAsignacion > 0 && idHorario > 0)
    ? await getPlanillaAsistencia({ idAsignacion, idHorario, fecha: fechaSeleccionada })
    : null;

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">

      <AsistenciasHeader
        fechaISO={fechaISO}
        hoyISO={hoyISO}
        idAsignacion={idAsignacion}
        nombreDia={nombreDiaSeleccionado}
      />

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
            {Object.keys(horariosPorAsignacion).length === 0 ? (
              <div className="py-20 text-center text-slate-300 italic text-xs px-6">
                No hay clases registradas para el día {nombreDiaSeleccionado.toLowerCase()}.
              </div>
            ) : (
              Object.entries(horariosPorAsignacion).map(([idAsig, horarios]) => {
                const asig = asignaciones.find(a => a.idAsignacion === Number(idAsig));
                if (!asig) return null;

                const horariosStr = horarios.map(h => `${h.horaInicio.slice(0, 5)}`).join(' - ');
                const primerHorario = horarios[0];
                const isSelected = idAsignacion !== 0 && idAsignacion === asig.idAsignacion;

                return (
                  <a
                    key={idAsig}
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

        {planilla ? (
          <AsistenciaView 
            initialPlanilla={planilla}
            idAsignacion={idAsignacion}
            idHorario={idHorario}
            fechaISO={fechaISO}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center text-center p-6">
             <Clock size={32} className="text-slate-300 mb-2" />
            <h3 className="font-black text-slate-500">Seleccione un bloque</h3>
            <p className="text-xs text-slate-400">Elija una materia y un bloque horario para ver la lista de alumnos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
