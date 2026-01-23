import {
  ClipboardList,
  UserCheck,
  Calendar,
  GraduationCap,
} from "lucide-react";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(d);
}

export default function DashboardDocente({
  data,
}: {
  data: {
    clasesHoy: any[];
    pendientes: any[];
    notasRecientes: any[];
    cierres: any[];
  };
}) {
  const { clasesHoy, pendientes, notasRecientes, cierres } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Calendar size={24} />} title="Clases de hoy" value={clasesHoy.length} color="indigo" />
        <StatCard icon={<UserCheck size={24} />} title="Asistencias pendientes" value={pendientes.length} color="emerald" />
        <StatCard icon={<ClipboardList size={24} />} title="Notas recientes" value={notasRecientes.length} color="blue" />
        <StatCard icon={<GraduationCap size={24} />} title="Próximos cierres" value={cierres.length} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Clases de hoy">
          {clasesHoy.length ? (
            <ul className="space-y-2">
              {clasesHoy.map((h: any) => (
                <li key={h.idHorario} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-black text-slate-800">
                    {h.horaInicio} - {h.horaFin} {h.aula ? `· Aula ${h.aula}` : ""}
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    {h.asignacion.materia.nombre} · {h.asignacion.curso.grado} {h.asignacion.curso.seccion} · {h.asignacion.ciclo.anio}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No tenés clases hoy." />
          )}
        </Panel>

        <Panel title="Asistencias pendientes (hoy)">
          {pendientes.length ? (
            <ul className="space-y-2">
              {pendientes.map((p: any) => (
                <li key={p.horario.idHorario} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-black text-slate-800">
                        {p.horario.horaInicio} - {p.horario.horaFin}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">
                        {p.horario.asignacion.materia.nombre} · {p.horario.asignacion.curso.grado} {p.horario.asignacion.curso.seccion}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-slate-800">{p.faltan} faltan</div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        {p.asistenciasCargadas}/{p.totalAlumnos}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No tenés asistencias pendientes hoy." />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Notas cargadas recientemente">
          {notasRecientes.length ? (
            <ul className="space-y-2">
              {notasRecientes.map((n: any) => {
                const persona = n.matricula.alumno.persona;
                return (
                  <li key={n.idNota} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-black text-slate-800">
                          {persona.apellido}, {persona.nombre} · {n.asignacion.materia.nombre}
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                          {n.asignacion.curso.grado} {n.asignacion.curso.seccion} · {n.tipo} · {n.periodo.nombre}
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-800">{n.nota}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty text="Todavía no cargaste notas." />
          )}
        </Panel>

        <Panel title="Próximos cierres">
          {cierres.length ? (
            <ul className="space-y-2">
              {cierres.map((p: any) => (
                <li key={p.idPeriodo} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-black text-slate-800">{p.nombre}</div>
                  <div className="text-sm text-slate-500 font-medium">
                    Ciclo {p.ciclo.anio} · {formatDate(p.fechaInicio)} → {formatDate(p.fechaFin)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No hay cierres próximos cargados." />
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "indigo" | "emerald" | "blue" | "purple";
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>{icon}</div>
        <h3 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{title}</h3>
      </div>
      <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{text}</p>
    </div>
  );
}
