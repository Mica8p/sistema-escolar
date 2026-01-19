import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCicloActual } from "@/lib/ciclo-session";
import { getHijosConAsistenciaCompleta } from "@/service/padre.service";
import CardAsistenciaHijo from "@/components/modules/padres/CardAsistenciaHijo";
import { Sparkles, Users, Calendar, Wallet } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  // 1. SEGURIDAD: Si no hay sesión, al login
  if (!session?.user) {
    redirect("/login");
  }

  // 2. IDENTIFICACIÓN DE ROLES Y CONTEXTO 2026
const idPersona = session.user.idPersona;
const esPadre = session.user.roles.includes("PADRE");
const idCiclo = await getCicloActual();

  // 3. OBTENCIÓN DE DATOS PARA PADRES
  let hijosData: any[] = [];
  if (esPadre && idPersona && idCiclo) {
  // Pasamos idPersona al servicio
  hijosData = await getHijosConAsistenciaCompleta(idPersona, idCiclo);
}

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen space-y-8">

      {/* HEADER DE BIENVENIDA DINÁMICO */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles size={160} className="text-indigo-600"/>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            ¡Hola, {session.user.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 font-medium italic">
            {esPadre
              ? "Aquí tienes el resumen escolar de tu familia para el ciclo 2026."
              : "Este es el panel de control institucional de Escuela Pro."}
          </p>
        </div>
      </div>

      {/* VISTA PARA PADRES */}
      {esPadre ? (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-700 uppercase tracking-widest px-2 flex items-center gap-3">
            <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-white" />
            </span>
            Seguimiento de mis Hijos
          </h2>

          {hijosData.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="flex justify-center mb-4">
                <Users size={48} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                No se encontraron hijos asociados o matriculados en el ciclo 2026.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {hijosData.map((hijo) => (
                <CardAsistenciaHijo key={hijo.idAlumno} hijoData={hijo} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VISTA PARA ADMIN / DOCENTES (Tus widgets originales pero mejorados) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Users size={24} />
              </div>
              <h3 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Alumnos Activos</h3>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">--</p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Wallet size={24} />
              </div>
              <h3 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Cuotas al Día</h3>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">--</p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <Calendar size={24} />
              </div>
              <h3 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Próximos Eventos</h3>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">0</p>
          </div>
        </div>
      )}
    </div>
  );
}