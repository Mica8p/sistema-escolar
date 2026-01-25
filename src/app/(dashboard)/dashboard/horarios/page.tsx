// src/app/(dashboard)/dashboard/horarios/page.tsx
import { getHorariosPorCurso } from "@/service/horario.service";
import { getCicloActual } from "@/lib/ciclo-session";
import db from "@/lib/db";
import GrillaSemanal from "@/components/modules/horarios/GrillaSemanal";

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const { curso } = await searchParams;

  const idCiclo = await getCicloActual();
  const idCurso = curso ? parseInt(curso) : null;

  const cursos = await db.curso.findMany({
    orderBy: { grado: 'asc' }
  });

  const horarios = idCurso ? await getHorariosPorCurso(idCurso, idCiclo) : [];

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Gestión de Horarios</h1>
        <p className="text-slate-500 font-medium italic">Ciclo Lectivo 2026</p>
      </header>

      {/* Selector de Curso */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex gap-6 items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seleccionar Curso:</span>
        <form className="flex gap-3">
          <select
            name="curso"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            defaultValue={curso || ""}
          >
            <option value="" disabled>Elegir curso...</option>
            {cursos.map(c => (
              <option key={c.idCurso} value={c.idCurso}>
                {c.grado} "{c.seccion}" - {c.turno}
              </option>
            ))}
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all">
            Ver Grilla
          </button>
        </form>
      </div>

      {idCurso ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <GrillaSemanal horarios={horarios} />
        </div>
      ) : (
        <div className="p-24 text-center border-2 border-dashed border-slate-200 rounded-[3.5rem] bg-white/50">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
            Selecciona un curso para visualizar el cuadro horario de la institución.
          </p>
        </div>
      )}
    </div>
  );
}