import { auth } from "@/auth";
import { getAsignacionesParaUsuario } from "@/service/calificaciones.service";
import { getHorariosByAsignaciones, getPlanillaAsistencia } from "@/service/asistencias.service";
import { getCicloActual } from "@/lib/ciclo-session";
import { Materia } from "@prisma/client";
import AsistenciasClient from "./AsistenciasClient";

export default async function AsistenciasPage({
  searchParams
}: {
  searchParams: Promise<{ mat?: string; horario?: string; fecha?: string }>
}) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const idCiclo = await getCicloActual();
  const isAdmin = session.user.roles.includes("ADMIN");
  const idPersona = session.user.idPersona ?? 0;

  const asignaciones = await getAsignacionesParaUsuario({ isAdmin, idPersona, idCiclo });

  const materiasUnicas = asignaciones.reduce((acc, a) => {
    if (!acc.find(m => m.idMateria === a.materia.idMateria)) {
      acc.push(a.materia);
    }
    return acc;
  }, [] as Materia[]);


  // 1. GESTIÓN DE FECHAS (Server Side)
  const hoy = new Date();
  const hoyISO = hoy.toISOString().split('T')[0];
  const fechaSeleccionada = params.fecha ? new Date(params.fecha + 'T12:00:00') : hoy;
  const fechaISO = fechaSeleccionada.toISOString().split('T')[0];

  const diasMapping = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
  const nombreDiaSeleccionado = diasMapping[fechaSeleccionada.getDay()];

  // 2. SELECCIÓN Y FILTRADO
  const idMateria = params.mat ? Number(params.mat) : (materiasUnicas[0]?.idMateria || 0);
  const asignacionesDeMateria = asignaciones.filter(a => a.materia.idMateria === idMateria);
  const idsAsignaciones = asignacionesDeMateria.map(a => a.idAsignacion);

  const horariosRaw = await getHorariosByAsignaciones(idsAsignaciones);
  const horariosFiltrados = horariosRaw.filter(h => h.diaSemana === nombreDiaSeleccionado);

  const horariosPorAsignacion = horariosFiltrados.reduce((acc, h) => {
    const key = h.idAsignacion;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(h);
    return acc;
  }, {} as Record<number, typeof horariosFiltrados>);

  const idHorario = params.horario ? Number(params.horario) : (horariosFiltrados[0]?.idHorario || 0);
  const horarioElegido = horariosFiltrados.find(h => h.idHorario === idHorario);

  const idAsignacion = horarioElegido?.idAsignacion || 0;


  const planilla = (idAsignacion > 0 && idHorario > 0)
    ? await getPlanillaAsistencia({ idAsignacion, idHorario, fecha: fechaSeleccionada })
    : null;

  return <AsistenciasClient
    asig={planilla?.asig}
    materiasUnicas={materiasUnicas}
    idMateria={idMateria}
    fechaISO={fechaISO}
    hoyISO={hoyISO}
    idAsignacion={idAsignacion}
    nombreDiaSeleccionado={nombreDiaSeleccionado}
    horariosPorAsignacion={horariosPorAsignacion}
    asignaciones={asignaciones}
    idHorario={idHorario}
    planilla={planilla}
    isAdmin={isAdmin}
  />;
}