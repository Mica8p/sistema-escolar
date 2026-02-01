import db from "@/lib/db";
import { getHijosConAsistenciaCompleta } from "@/service/padre.service";
import { getCalificacionesHijo } from "@/service/calificaciones.service";
import { getHorariosPorCurso } from "@/service/horario.service";
import { getDetalleCuenta } from "@/service/finanzas.service";
import { getContadorNoLeidos } from "@/service/comunicado.service";
import CardAsistenciaHijo from "@/components/modules/padres/CardAsistenciaHijo";
import SeccionCalificaciones from "@/components/modules/padres/SeccionCalificaciones";
import HorarioImprimible from "@/components/HorarioImprimible";
import { Users, Sparkles, Wallet, Calendar } from "lucide-react";
import Link from "next/link";

export default async function PadreView({ idPersona, idUsuario, idCiclo, idPadre }: any) {
  // Lógica de Comunicados
  const relaciones = await db.alumnoPadre.findMany({
    where: { idPadre: idPadre },
    include: { alumno: { include: { matriculas: { where: { estadoAcademico: "Activo" }, select: { idCurso: true } } } } }
  });
  const idsCursosHijos = relaciones.flatMap(r => r.alumno.matriculas.map(m => m.idCurso));
  const noLeidos = await getContadorNoLeidos(idUsuario, "PADRE", idsCursosHijos);

  // Lógica de Hijos
  const rawHijos = await getHijosConAsistenciaCompleta(idPersona, idCiclo);
  let totalDeudaFamilia = 0;

  const hijosData = await Promise.all(rawHijos.map(async (hijo: any) => {
    const matricula = await db.matricula.findFirst({ where: { idAlumno: hijo.idAlumno, idCiclo: idCiclo }, select: { idCurso: true } });
    const [notas, horarios, cuenta] = await Promise.all([
      getCalificacionesHijo(hijo.idAlumno, idCiclo),
      matricula?.idCurso ? getHorariosPorCurso(matricula.idCurso, idCiclo) : [],
      getDetalleCuenta(hijo.idAlumno)
    ]);
    const deudaHijo = cuenta.cargos.reduce((acc: number, cargo: any) => acc + (cargo.saldo || 0), 0);
    totalDeudaFamilia += deudaHijo;
    return { ...hijo, notas, horarios, deudaHijo, cuenta };
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">¡Información del día!</h1>
            <p className="text-slate-500 font-medium italic">{noLeidos > 0 ? `Tienes ${noLeidos} mensajes nuevos.` : "Estás al día."}</p>
          </div>
          <Link href="/dashboard/comunicados" className="relative z-10 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold">Leer mensajes</Link>
          <Sparkles size={160} className="absolute -right-10 -bottom-10 text-indigo-50 opacity-50" />
        </div>

        <Link href="/dashboard/finanzas">
          <div className={`p-8 rounded-[2.5rem] text-white flex flex-col justify-center h-full ${totalDeudaFamilia > 0 ? 'bg-rose-600' : 'bg-slate-900'}`}>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Deuda Familiar</p>
            <span className="text-2xl font-black">{totalDeudaFamilia > 0 ? `-$${totalDeudaFamilia.toLocaleString()}` : 'Al día'}</span>
            <Wallet className="opacity-20 self-end" size={32} />
          </div>
        </Link>
      </div>

      <div className="space-y-16">
        {hijosData.map((hijo) => (
          <div key={hijo.idAlumno} className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-8 flex items-center gap-6 text-white">
               <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center font-black text-4xl">{hijo.nombreCompleto?.charAt(0)}</div>
               <h3 className="text-3xl font-black">{hijo.nombreCompleto}</h3>
            </div>
            <div className="p-10 bg-slate-50/20 grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-5"><CardAsistenciaHijo hijoData={hijo} /></div>
               <div className="lg:col-span-7"><SeccionCalificaciones notas={hijo.notas} /></div>
               <div className="lg:col-span-12">
                 <HorarioImprimible horarios={hijo.horarios} nombreAlumno={hijo.nombreCompleto} curso={hijo.curso} />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}