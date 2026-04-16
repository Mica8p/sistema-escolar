import { auth } from "@/auth";
import { getAsignacionesParaUsuario } from "@/service/calificaciones.service";
import { getHorariosByAsignaciones, getPlanillaAsistencia } from "@/service/asistencias.service";
import { getCicloActual } from "@/lib/ciclo-session";
import { Materia, Turno } from "@prisma/client";
import AsistenciasClient from "./AsistenciasClient";
import db from "@/lib/db";
import { getEstadisticasAsistenciaAction } from "@/lib/actions/asistencias-actions";

export default async function AsistenciasPage({
  searchParams
}: {
  searchParams: Promise<{ curso?: string; turno?: Turno; mat?: string; horario?: string; fecha?: string; page?: string; search?: string; }>
}) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const idCiclo = await getCicloActual();
  const isAdmin = session.user.roles.includes("ADMIN");
  const idPersona = session.user.idPersona ?? 0;
  const currentPage = Number(params.page || "1");
  const search = params.search;

  const [asignaciones, cicloObj] = await Promise.all([
    getAsignacionesParaUsuario({ isAdmin, idPersona, idCiclo }),
    db.cicloLectivo.findUnique({ where: { idCiclo } })
  ]);

  const cursosAgrupados = asignaciones.reduce((acc, a) => {
    const key = `${a.curso.grado}° ${a.curso.seccion}`;
    if (!acc[key]) {
      acc[key] = {
        idCurso: a.idCurso,
        grado: a.curso.grado,
        seccion: a.curso.seccion,
        turnos: new Set<Turno>()
      };
    }
    acc[key].turnos.add(a.curso.turno);
    return acc;
  }, {} as Record<string, { idCurso: number; grado: string; seccion: string; turnos: Set<Turno> }>);

  const cursos = Object.values(cursosAgrupados).map(c => ({ ...c, turnos: Array.from(c.turnos) }));

  const idCurso = params.curso ? Number(params.curso) : (cursos[0]?.idCurso || 0);
  const selectedCursoInfo = cursos.find(c => c.idCurso === idCurso);
  
  const turno = params.turno || (selectedCursoInfo?.turnos[0] || 'Mañana');

  const materiasUnicas = asignaciones
    .filter(a => a.curso.grado === selectedCursoInfo?.grado && a.curso.seccion === selectedCursoInfo?.seccion && a.curso.turno === turno)
    .reduce((acc, a) => {
      if (!acc.find(m => m.idMateria === a.materia.idMateria)) {
        acc.push(a.materia);
      }
      return acc;
    }, [] as Materia[]);
    
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const hoy = new Date();
  const hoyISO = formatLocalDate(hoy);
  const fechaSeleccionada = params.fecha ? parseLocalDate(params.fecha) : hoy;
  const fechaISO = formatLocalDate(fechaSeleccionada);

  const diasMapping = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
  const nombreDiaSeleccionado = diasMapping[fechaSeleccionada.getDay()];

  const idMateria = params.mat ? Number(params.mat) : (materiasUnicas[0]?.idMateria || 0);
  const asignacionesDeMateria = asignaciones.filter(a => a.materia.idMateria === idMateria && a.curso.grado === selectedCursoInfo?.grado && a.curso.seccion === selectedCursoInfo?.seccion && a.curso.turno === turno);
  const idsAsignaciones = asignacionesDeMateria.map(a => a.idAsignacion);

  const horariosRaw = await getHorariosByAsignaciones(idsAsignaciones);
  const horariosFiltrados = horariosRaw.filter(h => h.diaSemana === nombreDiaSeleccionado);
  
  const horariosPorCurso = horariosFiltrados.reduce((acc, h) => {
    const asig = asignacionesDeMateria.find(a => a.idAsignacion === h.idAsignacion);
    if (!asig) return acc;

    const key = asig.idCurso;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(h);
    return acc;
  }, {} as Record<number, typeof horariosFiltrados>);
  
  const idHorario = params.horario ? Number(params.horario) : (horariosFiltrados[0]?.idHorario || 0);
  const horarioElegido = horariosFiltrados.find(h => h.idHorario === idHorario);

  const idAsignacion = horarioElegido?.idAsignacion || 0;
  
  const anioActual = cicloObj?.anio || 2026;
  
  const planilla = (idAsignacion > 0 && idHorario > 0)
    ? await getPlanillaAsistencia({ idAsignacion, idHorario, fecha: fechaSeleccionada, page: search ? currentPage : 0, search })
    : null;

  const estadisticasAsistenciaArray = idAsignacion > 0
    ? await getEstadisticasAsistenciaAction(idAsignacion)
    : [];
  
  const estadisticasAsistencia = new Map(estadisticasAsistenciaArray as Array<[number, { presentes: number; ausentes: number; totalClases: number }]>);

  const totalPages = planilla && search
    ? Math.ceil(planilla.totalMatriculas / 5)
    : 1;
  
  return <AsistenciasClient
    asig={planilla?.asig}
    cursos={cursos}
    idCurso={idCurso}
    turno={turno}
    materiasUnicas={materiasUnicas}
    idMateria={idMateria}
    fechaISO={fechaISO}
    hoyISO={hoyISO}
    idAsignacion={idAsignacion}
    nombreDiaSeleccionado={nombreDiaSeleccionado}
    idHorario={idHorario}
    planilla={planilla}
    estadisticasAsistencia={estadisticasAsistencia}
    isAdmin={isAdmin}
    currentPage={currentPage}
    totalPages={totalPages}
    search={search}
  />;
}

