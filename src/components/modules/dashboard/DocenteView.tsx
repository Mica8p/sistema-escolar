import { getClasesDeHoyDocente, getAsistenciasPendientesDocente, getNotasRecientesDocente, getProximosCierresDocente } from "@/service/profesor-dashboard.service";
import { StatCard, Panel, Empty, formatDate } from "@/components/modules/dashboard/DashboarShared";
import { Calendar, UserCheck, ClipboardList, GraduationCap } from "lucide-react";

export default async function DocenteView({ idProfesor }: { idProfesor: number | null }) {
  if (!idProfesor) return <Empty text="Usuario sin perfil docente asociado." />;

  const [clasesHoy, pendientes, notasRecientes, cierres] = await Promise.all([
    getClasesDeHoyDocente(idProfesor),
    getAsistenciasPendientesDocente(idProfesor),
    getNotasRecientesDocente(idProfesor, 8),
    getProximosCierresDocente(idProfesor, 5),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Calendar size={24} />} title="Clases de hoy" value={clasesHoy.length} color="indigo" />
        <StatCard icon={<UserCheck size={24} />} title="Pendientes" value={pendientes.length} color="emerald" />
        <StatCard icon={<ClipboardList size={24} />} title="Notas" value={notasRecientes.length} color="blue" />
        <StatCard icon={<GraduationCap size={24} />} title="Cierres" value={cierres.length} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL: CLASES */}
        <Panel title="Clases de hoy">
          {clasesHoy.length ? (
            <ul className="space-y-2">
              {clasesHoy.map((h: any) => (
                <li key={h.idHorario} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-black text-slate-800">{h.horaInicio} - {h.horaFin}</div>
                  <div className="text-sm text-slate-500 font-medium">{h.asignacion.materia.nombre} · {h.asignacion.curso.grado} {h.asignacion.curso.seccion}</div>
                </li>
              ))}
            </ul>
          ) : <Empty text="No tenés clases hoy." />}
        </Panel>

        {/* PANEL: ASISTENCIAS (Cambiado docenteData por pendientes) */}
        <Panel title="Asistencias pendientes (hoy)">
          {pendientes.length ? (
            <ul className="space-y-2">
              {pendientes.map((p: any) => (
                <li key={p.horario.idHorario} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-black text-slate-800">{p.horario.horaInicio} - {p.horario.horaFin}</div>
                      <div className="text-sm text-slate-500 font-medium">{p.horario.asignacion.materia.nombre} · {p.horario.asignacion.curso.grado} {p.horario.asignacion.curso.seccion}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-800">{p.faltan} faltan</div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{p.asistenciasCargadas}/{p.totalAlumnos}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : <Empty text="No tenés asistencias pendientes hoy." />}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL: NOTAS (Cambiado docenteData por notasRecientes) */}
        <Panel title="Notas cargadas recientemente">
          {notasRecientes.length ? (
            <ul className="space-y-2">
              {notasRecientes.map((n: any) => {
                const persona = n.matricula.alumno.persona;
                return (
                  <li key={n.idNota} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-black text-slate-800">{persona.apellido}, {persona.nombre} · {n.asignacion.materia.nombre}</div>
                        <div className="text-sm text-slate-500 font-medium">{n.asignacion.curso.grado} {n.asignacion.curso.seccion} · {n.tipo} · {n.periodo.nombre}</div>
                      </div>
                      <div className="text-3xl font-black text-slate-800">{n.nota}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <Empty text="Todavía no cargaste notas." />}
        </Panel>

        {/* PANEL: CIERRES (Cambiado docenteData por cierres) */}
        <Panel title="Próximos cierres">
          {cierres.length ? (
            <ul className="space-y-2">
              {cierres.map((p: any) => (
                <li key={p.idPeriodo} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-black text-slate-800">{p.nombre}</div>
                  <div className="text-sm text-slate-500 font-medium">Ciclo {p.ciclo.anio} · {formatDate(p.fechaInicio)} → {formatDate(p.fechaFin)}</div>
                </li>
              ))}
            </ul>
          ) : <Empty text="No hay cierres próximos cargados." />}
        </Panel>
      </div>
    </div>
  );
}