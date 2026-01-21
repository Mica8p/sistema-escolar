import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCicloActual } from "@/lib/ciclo-session";
import { getHijosConAsistenciaCompleta } from "@/service/padre.service";
import { getCalificacionesHijo } from "@/service/calificaciones.service";
import CardAsistenciaHijo from "@/components/modules/padres/CardAsistenciaHijo";
import SeccionCalificaciones from "@/components/modules/padres/SeccionCalificaciones";
import { Sparkles, Users, Calendar, Wallet, GraduationCap } from "lucide-react";

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
    const rawHijos = await getHijosConAsistenciaCompleta(idPersona, idCiclo);

    hijosData = await Promise.all(rawHijos.map(async (hijo: any) => {
      const notas = await getCalificacionesHijo(hijo.idAlumno, idCiclo);
      return {
        ...hijo,
        notas
      };
    }));
  }

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen space-y-5">

      {/* HEADER DE BIENVENIDA DINÁMICO */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles size={160} className="text-indigo-600" />
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
            <div className="p-8 bg-slate-100 min-h-screen space-y-10">

    {/* 1. SECCIÓN DE COMUNICADOS URGENTES (UX de Notificaciones) */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">¡Información del día!</h1>
          <p className="text-slate-500 font-medium italic mt-1">Tienes 2 comunicados sin leer de la institución.</p>
        </div>
        <button className="relative z-10 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          Leer comunicados
        </button>
        <Sparkles size={160} className="absolute -right-10 -bottom-10 text-indigo-50 opacity-50" />
      </div>

      {/* Widget Rápido: Saldo/Pagos (Ejemplo de info pesada simplificada) */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cuota Febrero 2026</p>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-black text-emerald-400">Al día</span>
          <Wallet className="text-slate-700" size={32} />
        </div>
      </div>
    </div>

    {/* 2. RECORRIDO DE HIJOS */}
    <div className="space-y-16">
        {hijosData.map((hijo) => (
          <div key={hijo.idAlumno} className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden">

            {/* Cabecera de Identidad */}
            <div className="bg-slate-900 p-8 flex items-center gap-6">
              <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                {hijo.nombreCompleto?.charAt(0)}
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter">{hijo.nombreCompleto}</h3>
                <span className="text-indigo-300 text-xs font-black uppercase tracking-widest">{hijo.curso} • Escuela Pro 2026</span>
              </div>
            </div>

            {/* Grid de Información Dual */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-10 bg-slate-50/20 items-stretch">
              <div className="lg:col-span-5">
                <CardAsistenciaHijo hijoData={hijo} />
              </div>
              <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-inner">
                {/* SeccionCalificaciones con etiquetas explícitas de PROMEDIO */}
                <SeccionCalificaciones notas={hijo.notas} />
              </div>
            </div>
          </div>
        ))}
      </div>
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