import { getDashboardAdminData } from "@/service/admin-dashboard.service";
import { StatCard, Panel } from "@/components/modules/dashboard/DashboarShared";
import { Users, GraduationCap, ClipboardList, Plus, Wallet, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import WelcomeHeader from "./WelcomeHeader";
import ChartAsistenciaGlobal from "@/components/modules/dashboard/ChartAsistenciaGlobal";

export default async function AdminView({ idCiclo, userName, userRoles }: { idCiclo: number, userName: string, userRoles: string[] }) {
  const adminData = await getDashboardAdminData(idCiclo);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <WelcomeHeader name={userName} roles={userRoles} />

      {/* 1. ESTADÍSTICAS GLOBALES DINÁMICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} title="Alumnos" value={adminData.alumnos} color="blue" />
        <StatCard icon={<GraduationCap size={20} />} title="Docentes" value={adminData.docentes} color="purple" />
        <StatCard icon={<ClipboardList size={20} />} title="Cursos Activos" value={adminData.cursos} color="emerald" />
        <StatCard icon={<TrendingUp size={20} />} title="Asistencia Mes" value={`${adminData.promedioAsis}%`} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* --- COLUMNA PRINCIPAL --- */}
        <div className="lg:col-span-2 space-y-8">

          {/* RESUMEN FINANCIERO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/80 shadow-2xl shadow-slate-300/40 flex items-center gap-6 group hover:border-emerald-200 transition-all">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Wallet size={28} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cobranza Febrero</p>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tighter">
                    ${adminData.recaudacionMes.toLocaleString('es-AR')}
                  </h4>
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tight italic">Ingresos del mes</span>
               </div>
            </div>

            <Link href="/dashboard/finanzas/reporte-deudores" className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex items-center justify-between group hover:bg-slate-800 transition-all border border-slate-800">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Morosidad Actual</p>
                  <h4 className="text-2xl font-black text-white tracking-tighter">
                    ${adminData.morosidadTotal.toLocaleString('es-AR')}
                  </h4>
                  <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tighter">
                    {adminData.totalDeudores} deudas pendientes
                  </p>
               </div>
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={20} />
               </div>
            </Link>
          </div>

          {/* GRÁFICO DE ASISTENCIA */}
          <Panel title="📈 Asistencia por Nivel Educativo">
            <div className="h-75 w-full mt-4 bg-white rounded-4xl p-6 border border-slate-200/60 relative shadow-inner">
               <ChartAsistenciaGlobal data={adminData.asistenciaGlobal} />
            </div>
            <div className="flex justify-center gap-6 mt-4">
               {adminData.asistenciaGlobal.map((n: { nivel: string; porcentaje: number; color: string }) => (
                 <div key={n.nivel} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: n.color }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {n.nivel}: {n.porcentaje}%
                    </span>
                 </div>
               ))}
            </div>
          </Panel>

        </div>

        {/* --- COLUMNA LATERAL --- */}
        <div className="space-y-8">

          <Panel title="⚡ Acciones Rápidas">
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/dashboard/comunicados/nuevo" className="flex items-center justify-between p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group">
                <span className="font-black text-[10px] uppercase tracking-widest">Crear Comunicado</span>
                <Plus size={18} />
              </Link>
              <Link href="/dashboard/alumnos" className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl text-slate-700 hover:border-indigo-500 transition-all group">
                <span className="font-black text-[10px] uppercase tracking-widest">Inscribir Alumno</span>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </Link>
            </div>
          </Panel>

          <Panel title="📢 Comunicados Enviados">
            <div className="space-y-3 mt-4">
              {adminData?.comunicadosRecientes.length > 0 ? (
                adminData.comunicadosRecientes.slice(0, 3).map((c: { idComunicado: number; titulo: string; fecha: string | Date; usuario: { persona: { nombre: string } } }) => (
                  <Link
                    key={c.idComunicado}
                    href={`/dashboard/comunicados/${c.idComunicado}`}
                    className="block p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-indigo-100 transition-all group"
                  >
                    <p className="font-bold text-slate-800 text-[11px] leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">{c.titulo}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Por {c.usuario.persona.nombre}</span>
                      <span className="text-[8px] font-bold text-slate-300">{new Date(c.fecha).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic text-center py-4 uppercase font-black">Sin envíos recientes</p>
              )}
              <Link href="/dashboard/comunicados" className="block text-center text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-4 hover:underline">
                Ver centro de noticias
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}