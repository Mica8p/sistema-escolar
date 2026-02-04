import {
  getClasesDeHoyDocente,
  getAsistenciasPendientesDocente,
  getNotasRecientesDocente,
  getProximosCierresDocente,
  getRendimientoAsistenciaDocente,
  getComunicadosDashboard,
} from "@/service/profesor-dashboard.service";
import { StatCard, Panel, Empty } from "@/components/modules/dashboard/DashboarShared";
import { Calendar, UserCheck, ClipboardList, GraduationCap, Clock, ArrowRight, Bell, Zap } from "lucide-react";
import Link from "next/link";
import ChartAsistencia from "./ChartAsistencia";
import { getCicloActual } from "@/lib/ciclo-session";

export default async function DocenteView({ idProfesor, idUsuario }: { idProfesor: number | null, idUsuario: number }) {
  if (!idProfesor) return <Empty text="Usuario sin perfil docente asociado." />;

  const idCiclo = await getCicloActual();
  const clasesHoy = await getClasesDeHoyDocente(idProfesor);
  const idsCursos = Array.from(new Set(clasesHoy.map(h => h.asignacion.idCurso)));

  const [pendientes, notasRecientes, cierres, rendimiento, comunicados] = await Promise.all([
    getAsistenciasPendientesDocente(idProfesor),
    getNotasRecientesDocente(idProfesor, 5),
    getProximosCierresDocente(idProfesor, 3),
    getRendimientoAsistenciaDocente(idProfesor),
    getComunicadosDashboard(idUsuario, idsCursos),
  ]);

  const ahoraDate = new Date();
  const horaActual = ahoraDate.getHours().toString().padStart(2, '0') + ":" + ahoraDate.getMinutes().toString().padStart(2, '0');

  const clasesFinalizadas = clasesHoy.filter(h => h.horaFin < horaActual).length;
  const progresoDia = clasesHoy.length > 0 ? (clasesFinalizadas / clasesHoy.length) * 100 : 0;

  const claseActual = clasesHoy.find(h => horaActual >= h.horaInicio && horaActual <= h.horaFin);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {claseActual && (
      <div className="bg-linear-to-br from-indigo-700 via-indigo-600 to-blue-600 p-1 rounded-[2.5rem] shadow-2xl shadow-indigo-200 animate-pulse-subtle">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-[2.4rem] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
              <Zap size={32} fill="currentColor" />
            </div>
            <div>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase mb-2 inline-block">
                Clase en curso
              </span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                {claseActual.asignacion.materia.nombre}
              </h2>
              <p className="text-slate-500 font-bold">
                {claseActual.asignacion.curso.grado}° "{claseActual.asignacion.curso.seccion}" · Finaliza a las {claseActual.horaFin}
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/asistencias/nueva?idHorario=${claseActual.idHorario}`}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            <UserCheck size={18} /> Tomar Asistencia Ahora
          </Link>
        </div>
      </div>
    )}
      {clasesHoy.length > 0 && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Estado de tu jornada</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tighter">
                {clasesFinalizadas === clasesHoy.length
                  ? "¡Has terminado todas tus clases! 🙌"
                  : `Has completado ${clasesFinalizadas} de ${clasesHoy.length} sesiones`}
              </h3>
            </div>
            <span className="text-3xl font-black text-indigo-600 tracking-tighter">{Math.round(progresoDia)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-600 to-blue-500 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(79,70,229,0.4)]"
              style={{ width: `${progresoDia}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/horarios" className="hover:scale-[1.03] transition-transform">
          <StatCard icon={<Calendar size={18} />} title="Mis Clases" value={clasesHoy.length} color="indigo" />
        </Link>
        <Link href="/dashboard/asistencias" className="hover:scale-[1.03] transition-transform">
          <StatCard icon={<UserCheck size={18} />} title="Pendientes" value={pendientes.length} color="emerald" />
        </Link>
        <StatCard icon={<ClipboardList size={18} />} title="Notas Cargadas" value={notasRecientes.length} color="blue" />
        <StatCard icon={<GraduationCap size={18} />} title="Cierres Prox." value={cierres.length} color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

        {/* --- SECCIÓN 3: AGENDA TIMELINE --- */}
        <div className="xl:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic uppercase">
                <Clock className="text-indigo-500" size={20} /> Agenda de Hoy
              </h3>
              <div className="px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                Martes 03/02
              </div>
            </div>

            {clasesHoy.length ? (
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                {clasesHoy.map((h: any) => {
                  const esAhora = horaActual >= h.horaInicio && horaActual <= h.horaFin;
                  const yaPaso = horaActual > h.horaFin;

                  return (
                    <div key={h.idHorario} className={`relative pl-10 transition-all duration-500 ${yaPaso ? 'opacity-40 grayscale-[0.3]' : ''}`}>
                      {/* Puntito de la línea de tiempo */}
                      <div className={`absolute left-11px top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white shadow-md transition-colors ${esAhora ? 'bg-indigo-600 animate-pulse' : yaPaso ? 'bg-slate-300' : 'bg-white'}`} />

                      {/* Tarjeta de clase */}
                      <div className={`p-4 rounded-2rem border transition-all duration-500 ${esAhora ? 'bg-indigo-50/50 border-indigo-200 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-200' : 'bg-white border-slate-100'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center border-r border-slate-100 pr-6">
                              <span className={`text-sm font-black tracking-tighter ${esAhora ? 'text-indigo-600' : 'text-slate-600'}`}>{h.horaInicio}</span>
                              <span className="text-[10px] font-bold text-slate-400">{h.horaFin}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-md font-black text-slate-800 uppercase tracking-tighter">{h.asignacion.materia.nombre}</h4>
                                {esAhora && <span className="bg-indigo-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black animate-bounce">AHORA</span>}
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {h.asignacion.curso.grado}° "{h.asignacion.curso.seccion}" · {h.asignacion.curso.turno}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/dashboard/asistencias/nueva?idHorario=${h.idHorario}`}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center ${esAhora ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                          >
                            {yaPaso ? 'Ver Resumen' : 'Pasar Lista'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <Empty text="No tenés clases programadas para hoy." />}
          </div>
        </div>

        {/* --- SECCIÓN 4: COLUMNA DERECHA (GRÁFICO Y AVISOS) --- */}
        <div className="space-y-8">
<Panel
  title={
    <div className="flex justify-between items-center w-full">
      <span className="flex items-center gap-2">📢 Comunicados</span>
      <Link href="/dashboard/comunicados" className="text-[10px] text-indigo-500 hover:underline font-black uppercase tracking-tighter">
        Ver Todo
      </Link>
    </div>
  }
>
  <div className="space-y-4">
    {comunicados && comunicados.length > 0 ? (
      comunicados.map((com: any) => {
        const isRead = com.vistos && com.vistos.length > 0;

        return (
          <Link
            key={com.idComunicado}
            href={`/dashboard/comunicados/${com.idComunicado}`}
            className={`block p-4 rounded-1.5rem border transition-all group relative overflow-hidden ${
              isRead ? "bg-slate-50/50 border-slate-100" : "bg-white border-indigo-100 shadow-md ring-1 ring-indigo-50"
            }`}
          >
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
              <ArrowRight size={16} />
            </div>

            {!isRead && (
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.6)] animate-pulse z-20" />
            )}

            <div className="flex justify-between items-start mb-2 pr-6">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                isRead ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-600"
              }`}>
                {com.target}
              </span>
              <span className="text-[9px] text-slate-400 font-bold italic">
                {new Date(com.fecha).toLocaleDateString()}
              </span>
            </div>

            <h4 className={`text-xs font-black mb-1 transition-colors pr-4 ${
              isRead ? "text-slate-500" : "text-slate-800 group-hover:text-indigo-600"
            }`}>
              {com.titulo}
            </h4>
            <p className={`text-[11px] leading-relaxed line-clamp-2 font-medium pr-4 ${
              isRead ? "text-slate-400" : "text-slate-500"
            }`}>
              {com.contenido}
            </p>
          </Link>
        );
      })
    ) : (
      <Empty text="Sin avisos nuevos." />
    )}

    <Link
      href="/dashboard/comunicados"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-[10px] font-black uppercase text-slate-500 hover:bg-indigo-600 hover:text-white transition-all tracking-widest border border-slate-100 border-dashed"
    >
      Acceder al centro de noticias <ArrowRight size={14} />
    </Link>
  </div>
</Panel>

          <Panel title="📊 Asistencia por Curso">
            <div className="h-280px w-full mt-2 bg-slate-50/50 rounded-2rem p-4 border border-slate-100">
                <ChartAsistencia data={rendimiento} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mt-6 italic">
                Rendimiento histórico de asistencia
            </p>
          </Panel>
        </div>

      </div>
    </div>
  );
}