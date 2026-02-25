import db from "@/lib/db";
import { getHijosConAsistenciaCompleta } from "@/service/padre.service";
import { getCalificacionesHijo } from "@/service/calificaciones.service";
import { getHorariosPorCurso } from "@/service/horario.service";
import { getDetalleCuenta } from "@/service/finanzas.service";
import { getContadorNoLeidos } from "@/service/comunicado.service";
import CardAsistenciaHijo from "@/components/modules/padres/CardAsistenciaHijo";
import SeccionCalificaciones from "@/components/modules/padres/SeccionCalificaciones";
import HorarioImprimible from "@/components/HorarioImprimible";
import { FileText, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import WelcomeHeader from "./WelcomeHeader";

export default async function PadreView({ idPersona, idUsuario, idCiclo, idPadre, userName, userRoles }: any) {
  if (!idPadre) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase text-xs">Perfil no encontrado.</div>;
  }

  const relaciones = await db.alumnoPadre.findMany({
    where: { idPadre: idPadre },
    include: { alumno: { include: { matriculas: { where: { estadoAcademico: "Activo" }, select: { idCurso: true } } } } }
  });
  const idsCursosHijos = relaciones.flatMap(r => r.alumno.matriculas.map(m => m.idCurso));
  const noLeidos = await getContadorNoLeidos(idUsuario, "PADRE", idsCursosHijos);

  const rawHijos = await getHijosConAsistenciaCompleta(idPersona, idCiclo);

  const hijosData = await Promise.all(rawHijos.map(async (hijo: any) => {
    const matricula = await db.matricula.findFirst({
      where: { idAlumno: hijo.idAlumno, idCiclo: idCiclo },
      select: { idCurso: true, idMatricula: true }
    });

    const [notas, horarios, cuenta] = await Promise.all([
      getCalificacionesHijo(hijo.idAlumno, idCiclo),
      matricula?.idCurso ? getHorariosPorCurso(matricula.idCurso, idCiclo) : [],
      getDetalleCuenta(hijo.idAlumno)
    ]);

    const deudaHijo = cuenta.cargos.reduce((acc: number, cargo: any) => acc + (cargo.saldo || 0), 0);

    return {
      ...hijo,
      idMatricula: matricula?.idMatricula,
      idCurso: matricula?.idCurso,
      notas,
      horarios,
      deudaHijo,
      cuenta
    };
  }));

  const totalDeudaFamilia = hijosData.reduce((acc, h) => acc + h.deudaHijo, 0);

  return (
    <div className="space-y-8">
      <WelcomeHeader name={userName} roles={userRoles} />

      {/* BANNER DE INFORMACIÓN Y DEUDA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center justify-between relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">¡Información del día!</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest italic">
              {noLeidos > 0 ? `Tienes ${noLeidos} mensajes nuevos.` : "Estás al día."}
            </p>
          </div>
          <Link href="/dashboard/comunicados" className="relative z-10 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Leer mensajes
          </Link>
          <Sparkles size={120} className="absolute -right-6 -bottom-6 text-indigo-50 opacity-40" />
        </div>

        <Link href="/dashboard/finanzas" className="h-full">
          <div className={`p-6 rounded-[2rem] text-white flex flex-col justify-between h-full shadow-lg transition-transform hover:scale-[1.02] ${totalDeudaFamilia > 0 ? 'bg-rose-600 shadow-rose-100' : 'bg-slate-900 shadow-slate-200'}`}>
            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Deuda Familiar</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black tracking-tighter">{totalDeudaFamilia > 0 ? `-$${totalDeudaFamilia.toLocaleString()}` : 'Al día'}</span>
              <Wallet className="opacity-30" size={24} />
            </div>
          </div>
        </Link>
      </div>

      {/* LISTADO DE HIJOS */}
      <div className="space-y-8">
        {hijosData.map((hijo) => (
          <div key={hijo.idAlumno} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            {/* CABECERA HIJO */}
            <div className="bg-slate-900 p-5 flex items-center justify-between text-white">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                   {hijo.nombreCompleto?.charAt(0)}
                 </div>
                 <div>
                   <h3 className="text-xl font-black tracking-tight uppercase italic">{hijo.nombreCompleto}</h3>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Resumen Académico</p>
                 </div>
               </div>

               <Link
                  href={`/dashboard/alumnos/${hijo.idMatricula}/boletin`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl transition-all group z-20"
                >
                  <FileText size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ver Boletín Anual</span>
                </Link>
            </div>

            {/* CONTENIDO HIJO */}
            <div className="p-6 bg-slate-50/20 grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-4"><CardAsistenciaHijo hijoData={hijo} /></div>
               <div className="lg:col-span-8"><SeccionCalificaciones notas={hijo.notas} /></div>

               <div className="lg:col-span-12 border-t border-slate-100 pt-6">
                 <HorarioImprimible horarios={hijo.horarios} nombreAlumno={hijo.nombreCompleto} curso={hijo.curso} />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}