import db from "@/lib/db";
import { getHijosConAsistenciaCompleta } from "@/service/padre.service";
import { getCalificacionesHijo } from "@/service/calificaciones.service";
import { getHorariosPorCurso, getHorarioConfig } from "@/service/horario.service";
import { getDetalleCuenta } from "@/service/finanzas.service";
import { getContadorNoLeidos } from "@/service/comunicado.service";
import PadreViewClient from "@/components/modules/dashboard/PadreViewClient";
import { Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import WelcomeHeader from "./WelcomeHeader";

interface PadreViewProps {
  idPersona: number;
  idUsuario: number;
  idCiclo: number;
  idPadre: number | null;
  userName: string;
}

export default async function PadreView({ idPersona, idUsuario, idCiclo, idPadre, userName }: PadreViewProps) {
  if (!idPadre) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase text-xs">Perfil no encontrado.</div>;
  }

  const relaciones = await db.alumnoPadre.findMany({
    where: { idPadre: idPadre },
    include: { alumno: { include: { matriculas: { where: { estadoAcademico: "Activo" }, select: { idCurso: true } } } } }
  });
  const idsCursosHijos = relaciones.flatMap(r => r.alumno.matriculas.map(m => m.idCurso));
  const noLeidos = await getContadorNoLeidos(idUsuario, "PADRE", idsCursosHijos);

  const { bloques, dias } = await getHorarioConfig();
  const rawHijos = await getHijosConAsistenciaCompleta(idPersona, idCiclo) as Array<{
    idAlumno: number;
    nombreCompleto: string;
    curso: string;
    stats: {
      presentismo: number;
      ausencias: number;
      llegadasTarde: number;
      faltasJustificadas: number;
    };
  }>;

  const hijosData = await Promise.all(rawHijos.map(async (hijo: {
    idAlumno: number;
    nombreCompleto: string;
    curso: string;
    stats: {
      presentismo: number;
      ausencias: number;
      llegadasTarde: number;
      faltasJustificadas: number;
    };
  }) => {
    const matricula = await db.matricula.findFirst({
      where: { idAlumno: hijo.idAlumno, idCiclo: idCiclo },
      select: { idCurso: true, idMatricula: true }
    });

    const [notas, horarios, cuenta, curso] = await Promise.all([
      getCalificacionesHijo(hijo.idAlumno, idCiclo),
      matricula?.idCurso ? getHorariosPorCurso(matricula.idCurso, idCiclo) : [],
      getDetalleCuenta(hijo.idAlumno),
      matricula?.idCurso ? db.curso.findUnique({ where: { idCurso: matricula.idCurso } }) : null
    ]);

    const deudaHijo = cuenta.cargos.reduce((acc: number, cargo: { saldo?: number }) => acc + (cargo.saldo || 0), 0);
    
    // Filtrar bloques según el turno del curso
    const bloquesFiltrados = curso ? bloques.filter(b => b.turno === curso.turno) : bloques;

    return {
      idAlumno: hijo.idAlumno,
      nombreCompleto: hijo.nombreCompleto,
      curso: curso ? `${curso.grado}° "${curso.seccion}"` : hijo.curso,
      idMatricula: matricula?.idMatricula,
      idCurso: matricula?.idCurso,
      cursoObj: curso,
      notas,
      horarios,
      deudaHijo,
      cuenta,
      bloques: bloquesFiltrados,
      dias,
      stats: hijo.stats as {
        presentismo: number;
        ausencias: number;
        llegadasTarde: number;
        faltasJustificadas: number;
      }
    };
  }));

  const totalDeudaFamilia = hijosData.reduce((acc, h) => acc + h.deudaHijo, 0);

  return (
    <div className="space-y-8">
      <WelcomeHeader name={userName} />

      {/* BANNER DE INFORMACIÓN Y DEUDA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white p-6 rounded-4xl border border-slate-200 flex items-center justify-between relative overflow-hidden shadow-sm">
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
          <div className={`p-6 rounded-4xl text-white flex flex-col justify-between h-full shadow-lg transition-transform hover:scale-[1.02] ${totalDeudaFamilia > 0 ? 'bg-rose-600 shadow-rose-100' : 'bg-slate-900 shadow-slate-200'}`}>
            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Deuda Familiar</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black tracking-tighter">{totalDeudaFamilia > 0 ? `-$${totalDeudaFamilia.toLocaleString()}` : 'Al día'}</span>
              <Wallet className="opacity-30" size={24} />
            </div>
          </div>
        </Link>
      </div>

      {/* INFORMACIÓN DE HIJOS */}
      <PadreViewClient hijosData={hijosData} />
    </div>
  );
}