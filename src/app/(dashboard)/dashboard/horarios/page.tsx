import { getHorariosPorCurso, getHorariosPorDocente, getHorarioConfig } from "@/service/horario.service";
import { getCicloActual } from "@/lib/ciclo-session";
import db from "@/lib/db";
import GrillaSemanal from "@/components/modules/horarios/GrillaSemanal";
import { auth } from "@/auth";

interface HorarioCompleto {
  diaSemana: string;
  horaInicio: string;
  asignacion: {
    materia: {
      nombre: string;
    };
    curso: {
      grado: string;
      seccion: string;
      turno: string;
    } | null | undefined;
    profesor: {
      persona?: {
        apellido: string | null;
      };
    } | null | undefined;
  };
  aula?: string | null;
}

export default async function HorariosPage({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  let idProfesor = session?.user?.idProfesor;
  const esDocente = roles.includes("DOCENTE");
  const esAdmin = roles.includes("ADMIN");

  const { curso } = await searchParams;
  const idCiclo = await getCicloActual();

  // Ejecutar todas las queries que siempre se hacen en paralelo
  const [cicloActualObj, horarioConfig, profesorData] = await Promise.all([
    db.cicloLectivo.findUnique({ where: { idCiclo } }),
    getHorarioConfig(),
    esDocente && !idProfesor && session?.user?.idPersona
      ? db.profesor.findUnique({
          where: { idPersona: Number(session.user.idPersona) }
        })
      : Promise.resolve(null)
  ]);

  // Desempacar con validación
  const { bloques = [], dias = [] } = horarioConfig || {};

  if (profesorData) {
    idProfesor = profesorData.idProfesor;
  }

  let horarios: HorarioCompleto[] = [];
  let idCurso = curso ? parseInt(curso) : null;
  let cursoSeleccionado = null;

  if (esDocente && !esAdmin) {
    if (idProfesor) {
      horarios = (await getHorariosPorDocente(idProfesor, idCiclo)).map(h => ({
        ...h,
        asignacion: {
          ...h.asignacion,
          profesor: h.asignacion.profesor || undefined
        }
      }));
    }
    idCurso = null;
  } else {
    if (idCurso) {
      const [horariosData, cursoData] = await Promise.all([
        getHorariosPorCurso(idCurso, idCiclo).then(data => data.map(h => ({
          ...h,
          asignacion: {
            ...h.asignacion,
            profesor: h.asignacion.profesor || undefined
          }
        }))),
        db.curso.findUnique({ where: { idCurso } })
      ]);
      horarios = (horariosData as HorarioCompleto[]).map((h: HorarioCompleto) => ({
        ...h,
        asignacion: {
          ...h.asignacion,
          profesor: h.asignacion.profesor || undefined,
          curso: cursoData ? { grado: cursoData.grado, seccion: cursoData.seccion, turno: cursoData.turno } : undefined
        }
      }));
      cursoSeleccionado = cursoData;
    } else if (esDocente && idProfesor) {
      horarios = (await getHorariosPorDocente(idProfesor, idCiclo)).map(h => ({
        ...h,
        asignacion: {
          ...h.asignacion,
          profesor: h.asignacion.profesor || undefined
        }
      }));
    }
  }

  const cursos = esAdmin
    ? await db.curso.findMany({
        where: {
          asignaciones: {
            some: {
              idCiclo: idCiclo,
              estado: true
            }
          }
        },
        orderBy: [{ grado: 'asc' }, { seccion: 'asc' }]
      })
    : [];

  const horariosMañana = esDocente ? (horarios as HorarioCompleto[]).filter((h: HorarioCompleto) => h.asignacion.curso !== null && h.asignacion.curso !== undefined && h.asignacion.curso.turno === 'Mañana') : [];
  const horariosTarde = esDocente ? (horarios as HorarioCompleto[]).filter((h: HorarioCompleto) => h.asignacion.curso !== null && h.asignacion.curso !== undefined && h.asignacion.curso.turno === 'Tarde') : [];
  const bloquesMañana = bloques.filter(b => b.turno === 'Mañana');
  const bloquesTarde = bloques.filter(b => b.turno === 'Tarde');

  const bloquesFiltrados = cursoSeleccionado
    ? bloques.filter(b => b.turno === cursoSeleccionado.turno)
    : bloques;

  return (
   <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
          {esDocente ? "Mi Agenda Semanal" : "Gestión de Horarios"}
        </h1>
        <p className="text-slate-500 font-medium italic">
          Ciclo Lectivo {cicloActualObj?.anio || 2026}
        </p>
      </header>


      {esAdmin && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex gap-6 items-center">
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Seleccionar Curso:</span>
          <form className="flex gap-3">
            <select name="curso" defaultValue={curso || ""} className="text-[10px] font-black text-gray-600 uppercase tracking-widest transition-all">
              <option value="" disabled>Elegir curso...</option>
              {cursos.map(c => (
                <option key={c.idCurso} value={c.idCurso}>{c.grado} &quot;{c.seccion}&quot; - {c.turno}</option>
              ))}
            </select>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all">Ver Grilla</button>
          </form>
        </div>
      )}

      {esDocente ? (
        <div className="space-y-12">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Turno Mañana</h2>
            <GrillaSemanal horarios={horariosMañana as HorarioCompleto[]} bloques={bloquesMañana} dias={dias} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Turno Tarde</h2>
            <GrillaSemanal horarios={horariosTarde as HorarioCompleto[]} bloques={bloquesTarde} dias={dias} />
          </div>
          {horarios.length === 0 && (
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <p>No tienes horarios asignados para este ciclo lectivo.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {idCurso ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GrillaSemanal horarios={horarios as HorarioCompleto[]} bloques={bloquesFiltrados} dias={dias}/>
            </div>
          ) : (
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <p>Selecciona un curso para visualizar el cuadro horario.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}