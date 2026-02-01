import { getDashboardAdminData } from "@/service/admin-dashboard.service";
import { StatCard, Panel } from "@/components/modules/dashboard/DashboarShared";
import { Users, GraduationCap, ClipboardList, Megaphone, Plus, Wallet } from "lucide-react";
import Link from "next/link";

export default async function AdminView({ idCiclo }: { idCiclo: number }) {
  const adminData = await getDashboardAdminData(idCiclo);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={24} />} title="Alumnos" value={adminData?.alumnos ?? 0} color="blue" />
        <StatCard icon={<GraduationCap size={24} />} title="Docentes" value={adminData?.docentes ?? 0} color="purple" />
        <StatCard icon={<ClipboardList size={24} />} title="Cursos Activos" value={adminData?.cursos ?? 0} color="emerald" />
        <StatCard icon={<Megaphone size={24} />} title="Comunicados" value={adminData?.comunicadosRecientes.length ?? 0} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Panel title="Últimos Comunicados Institucionales">
            <div className="space-y-4">
              {adminData?.comunicadosRecientes.map((c: any) => (
                <div key={c.idComunicado} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><Megaphone size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{c.titulo}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Por: {c.usuario.persona.nombre} {c.usuario.persona.apellido}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 italic">{new Date(c.fecha).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Gestión Rápida</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/dashboard/comunicados/nuevo" className="group p-4 bg-indigo-600 rounded-2xl flex items-center gap-4 hover:bg-indigo-700 transition-all text-white font-bold text-sm"><Plus /> Nuevo Comunicado</Link>
            <Link href="/dashboard/alumnos" className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-indigo-500 transition-all">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Users size={20} /></div>
                <span className="text-slate-700 font-bold text-sm">Registrar Alumno</span>
            </Link>
            <Link href="/dashboard/finanzas/reporte-deudores" className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-emerald-500 font-bold text-sm text-slate-700"><Wallet /> Ver Deudores</Link>
            <Link href="/dashboard/finanzas" className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-emerald-500 transition-all">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Wallet size={20} /></div>
                <span className="text-slate-700 font-bold text-sm">Verificar Cobros</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}