import {
  getClasesDeHoyDocente,
  getAsistenciasPendientesDocente,
  getNotasRecientesDocente,
  getProximosCierresDocente,
  getRendimientoAsistenciaDocente,
  getComunicadosDashboard,
  // Asumiendo que getDocenteDashboardPendingNotifications está en profesor-dashboard.service o lo importaremos directamente
} from "@/service/profesor-dashboard.service";
import { StatCard, Panel, Empty } from "@/components/modules/dashboard/DashboarShared";
import { Calendar, UserCheck, ClipboardList, GraduationCap, Clock, Zap, ClipboardCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import ChartAsistencia from "./ChartAsistencia";
import { getCicloActual } from "@/lib/ciclo-session";
import WelcomeHeader from "./WelcomeHeader";
import BannerClaseActualClient from "@/components/modules/dashboard/BannerClaseActualClient";
import { getDocenteDashboardPendingNotifications } from "@/service/calificaciones.service"; // Importa la nueva función

// Define la interfaz para las notificaciones
interface PendingNotification {
  periodoNombre: string;
  diasFaltantes: number;
  asignacionesPendientes: {
    materia: string;
    curso: string;
    idAsignacion: number;
  }[];
}

export default async function DocenteView({ idProfesor, idUsuario, userName, userRoles }: { idProfesor: number | null, idUsuario: number, userName: string, userRoles: string[] }) {
  if (!idProfesor) return <Empty text="Usuario sin perfil docente asociado." />;

  const idCiclo = await getCicloActual();
  // Llama a la nueva función para obtener las notificaciones dinámicas
  const pendingNotifications: PendingNotification[] = await getDocenteDashboardPendingNotifications(idProfesor, idCiclo);

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
      <WelcomeHeader name={userName} roles={userRoles} />

      {/* --- SECCIÓN 1: ESTADO DE LA JORNADA --- */}
      {clasesHoy.length > 0 && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
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
              className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${progresoDia}%` }}
            />
          </div>
        </div>
      )}

      {/* --- SECCIÓN 2: STAT CARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/horarios" className="hover:scale-[1.02] transition-transform"><StatCard icon={<Calendar size={18} />} title="Mis Clases" value={clasesHoy.length} color="indigo" /></Link>
        <Link href="/dashboard/asistencias" className="hover:scale-[1.02] transition-transform"><StatCard icon={<UserCheck size={18} />} title="Pendientes" value={pendientes.length} color="emerald" /></Link>
        <Link href="/dashboard/calificaciones" className="hover:scale-[1.02] transition-transform"><StatCard icon={<ClipboardList size={18} />} title="Notas Cargadas" value={notasRecientes.length} color="blue" /></Link>
        <StatCard icon={<GraduationCap size={18} />} title="Cierres Prox." value={cierres.length} color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

        {/* --- COLUMNA IZQUIERDA: BANNER Y AGENDA --- */}
        <div className="xl:col-span-2 space-y-6">

          {/*  BANNER DINÁMICO: Solo aparece si hay una clase ahora */}
          <BannerClaseActualClient clasesHoy={clasesHoy} />

          {/* --- NOTIFICACIÓN FIJA DE NOTAS PENDIENTES (ROJO) --- */}
          {pendingNotifications.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-[2.5rem] shadow-sm mb-8">
              <p className="font-bold text-lg mb-2">⚠️ ¡ATENCIÓN! Notas Pendientes por Cargar</p>
              {pendingNotifications.map((notif, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <p className="font-semibold">El período "{notif.periodoNombre}" cierra en {notif.diasFaltantes} día(s).</p>
                  <p className="text-sm">Debes cargar las notas de las siguientes asignaciones:</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    {notif.asignacionesPendientes.map((asig, idx) => (
                      <li key={idx}>Materia: {asig.materia} - Curso: {asig.curso}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-sm mt-4 italic font-bold text-red-900">
                Este mensaje permanecerá visible hasta que todas las notas pendientes sean cargadas.
              </p>
            </div>
          )}
          {/* --- FIN NOTIFICACIÓN FIJA DE NOTAS PENDIENTES --- */}

          {/* AGENDA TIMELINE */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic uppercase">
                <Clock className="text-indigo-500" size={20} /> Agenda de Hoy
              </h3>
            </div>

            {clasesHoy.length ? (
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                {clasesHoy.map((h: any) => {
                  const esAhora = h.idHorario === claseActual?.idHorario;
                  const yaPaso = horaActual > h.horaFin;

                  return (
                    <div key={h.idHorario} className={`relative pl-10 transition-all duration-500 ${yaPaso ? 'opacity-40' : ''}`}>
                      <div className={`absolute -left-[11px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white shadow-md ${esAhora ? 'bg-indigo-600 animate-pulse' : yaPaso ? 'bg-slate-300' : 'bg-white'}`} />

                      <div className={`p-4 rounded-[2rem] border transition-all ${esAhora ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-100'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center border-r border-slate-100 pr-6">
                              <span className={`text-sm font-black tracking-tighter ${esAhora ? 'text-indigo-600' : 'text-slate-600'}`}>{h.horaInicio}</span>
                              <span className="text-[10px] font-bold text-slate-400">{h.horaFin}</span>
                            </div>
                            <div>
                              <h4 className="text-md font-black text-slate-800 uppercase tracking-tighter">{h.asignacion.materia.nombre}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {h.asignacion.curso.grado}° "{h.asignacion.curso.seccion}" · {h.asignacion.curso.turno}
                              </p>
                            </div>
                          </div>

                          {/* BOTONES DE ACCIÓN LÓGICOS */}
                          <div className="flex items-center gap-3">
                            {esAhora ? (
                              <span className="bg-indigo-100 text-indigo-600 text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">En curso</span>
                            ) : (
                              <Link
                                href={`/dashboard/asistencias?mat=${h.asignacion.idMateria}&horario=${h.idHorario}`}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${yaPaso ? 'text-slate-400 hover:text-indigo-600' : 'bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white'}`}
                              >
                                {yaPaso ? 'Ver Historial' : 'Pasar Lista'}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <Empty text="No tenés clases programadas para hoy." />}
          </div>
        </div>

        {/* --- COLUMNA DERECHA (Paneles Laterales) --- */}
        <div className="space-y-8 sticky top-8 h-fit">
          <Panel
            title={
              <div className="flex justify-between items-center w-full">
                <span>📢 Comunicados</span>
                <Link href="/dashboard/comunicados" className="text-[10px] text-indigo-500 hover:underline font-black uppercase tracking-tighter">Ver Todo</Link>
              </div>
            }
          >
            <div className="space-y-3">
              {comunicados?.slice(0,3).map((com: any) => (
                <Link key={com.idComunicado} href={`/dashboard/comunicados/${com.idComunicado}`} className="block p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-200 transition-all group">
                  <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black uppercase bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md">{com.target}</span>
                      <span className="text-[8px] text-slate-400 font-bold">{new Date(com.fecha).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase line-clamp-1 group-hover:text-indigo-600 transition-colors">{com.titulo}</h4>
                </Link>
              ))}
              {(!comunicados || comunicados.length === 0) && <Empty text="Sin novedades." />}
            </div>
          </Panel>

          <Panel title="📊 Rendimiento de Asistencia">
            <div className="h-[250px] w-full mt-2 relative">
               {rendimiento && rendimiento.length > 0 ? <ChartAsistencia data={rendimiento} /> : <Empty text="Sin datos suficientes." />}
            </div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mt-4 italic">Promedio últimos 30 días</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}