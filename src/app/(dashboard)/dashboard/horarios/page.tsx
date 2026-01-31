import { getHorariosPorCurso, getHorariosPorDocente } from "@/service/horario.service";
import { getCicloActual } from "@/lib/ciclo-session";
import db from "@/lib/db";
import GrillaSemanal from "@/components/modules/horarios/GrillaSemanal";
import { auth } from "@/auth";

export default async function HorariosPage({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const idProfesor = (session?.user as any)?.idProfesor;
  const esDocente = roles.includes("DOCENTE");
  const esAdmin = roles.includes("ADMIN");

  const { curso } = await searchParams;
  const idCiclo = await getCicloActual();

  let horarios: any[] = [];
  let idCurso = curso ? parseInt(curso) : null;

  if (esDocente && idProfesor) {
    horarios = await getHorariosPorDocente(idProfesor, idCiclo);
  } else if (idCurso) {
    horarios = await getHorariosPorCurso(idCurso, idCiclo);
  }

  const cursos = esAdmin ? await db.curso.findMany({ orderBy: { grado: 'asc' } }) : [];

  return (
   <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
          {esDocente ? "Mi Agenda Semanal" : "Gestión de Horarios"}
        </h1>
        <p className="text-slate-500 font-medium italic">Ciclo Lectivo 2026</p>
      </header>


      {/* Solo mostramos el selector si es Admin */}
      {esAdmin && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex gap-6 items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seleccionar Curso:</span>
          <form className="flex gap-3">
            <select name="curso" defaultValue={curso || ""} className="text-[10px] font-black text-gray-600 uppercase tracking-widest  shadow-lg shadow-neutral-300 transition-all">
              <option value="" disabled>Elegir curso...</option>
              {cursos.map(c => (
                <option key={c.idCurso} value={c.idCurso}>{c.grado} "{c.seccion}" - {c.turno}</option>
              ))}
            </select>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all">Ver Grilla</button>
          </form>
        </div>
      )}



      {/* Grilla */}
      {(idCurso || esDocente) ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <GrillaSemanal horarios={horarios} />
        </div>
      ) : (
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <p>Selecciona un curso para visualizar el cuadro horario.</p>
        </div>
      )}
    </div>
  );
}