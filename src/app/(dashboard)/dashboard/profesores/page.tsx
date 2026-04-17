import { ProfesorService } from "@/service/profesor.service";
import { AlumnoService } from "@/service/alumno.service";
import { Briefcase } from "lucide-react"; // Remove unused imports
import FormAsignacion from "./FormAsignacion";
import { getCicloActual } from "@/lib/ciclo-session";
import db from "@/lib/db";
import { ImportarAsignaciones } from "@/components/modules/profesores/ImportarAsignaciones";
import { AsignacionesList } from "./AsignacionesList";
import { HistorialAsignacionesTable } from "@/components/modules/profesores/HistorialAsignacionesTable"; // Import the new client component

interface PageProps {
  searchParams: Promise<{ 
    editId?: string;
    page?: string;
    day?: string;
   }>;
}

export default async function DocentesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const editId = params?.editId;
  const currentPage = Number(params?.page) || 1;
  const limit = 5;

  // Obtener el día de la semana seleccionado o usar el de hoy
  let selectedDay = params?.day;
  if (!selectedDay) {
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const today = new Date();
    selectedDay = diasSemana[today.getDay()];
  }

  let idCicloActual = await getCicloActual();

  // Obtener ciclo actual y ciclo fallback en paralelo (sin depender uno del otro)
  const [cicloActualInfo, cicloFallback, todosLosCiclos] = await Promise.all([
    db.cicloLectivo.findUnique({ where: { idCiclo: idCicloActual } }),
    db.cicloLectivo.findFirst({
      where: { estado: true },
      orderBy: { anio: 'desc' }
    }),
    db.cicloLectivo.findMany({
      orderBy: { anio: 'desc' }
    })
  ]);

  // Si no existe el ciclo actual pero hay uno en fallback, usar ese
  if (!cicloActualInfo && cicloFallback) {
    idCicloActual = cicloFallback.idCiclo;
  }

  // Obtener ciclo anterior usando el array de todos los ciclos (sin query adicional)
  const cicloActualAnio = cicloActualInfo?.anio ?? cicloFallback?.anio ?? 0;
  const cicloAnterior = todosLosCiclos.find(c => c.anio === cicloActualAnio - 1) || null;

  // Ejecutar todas las queries restantes en paralelo
  const [
    { profesores, total },
    personas,
    materias,
    cursos,
    historial,
    diasHabiles,
    bloquesHorario,
    asignacionAEditarData
  ] = await Promise.all([
    ProfesorService.getAllByDay(idCicloActual, selectedDay, currentPage, limit),
    ProfesorService.getPersonasDisponibles(),
    ProfesorService.getMaterias(),
    AlumnoService.getCursosDisponibles(),
    ProfesorService.getHistorialAsignaciones(idCicloActual),
    db.diaHabil.findMany({ where: { habilitado: true }, orderBy: { orden: 'asc' } }),
    db.bloqueHorario.findMany({ orderBy: { orden: 'asc' } }),
    editId 
      ? db.asignacionAcademica.findUnique({ 
          where: { idAsignacion: Number(editId) },
          include: {
            horarios: true,
            materia: true,
            curso: true,
            profesor: { include: { persona: true } }
          }
        })
      : null
  ]);

  const totalPages = Math.ceil(total / limit);
  const asignacionAEditar = asignacionAEditarData as typeof asignacionAEditarData ?? undefined;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <Briefcase className="h-8 w-8 text-indigo-600" />
        Gestión de Docentes {cicloActualInfo?.anio}
      </h1>

      {cicloAnterior && (
          <ImportarAsignaciones
            cicloActualId={idCicloActual}
            cicloAnteriorId={cicloAnterior.idCiclo}
            anioAnterior={cicloAnterior.anio}
            yaTieneDatos={total > 0}
          />
        )}

      <FormAsignacion
        editData={asignacionAEditar}
        personas={personas}
        materias={materias}
        cursos={cursos}
        idCiclo={idCicloActual}
        diasHabiles={diasHabiles}
        bloquesHorario={bloquesHorario}
      />

      <AsignacionesList 
        profesores={profesores} 
        suplentes={personas} 
        currentPage={currentPage}
        totalPages={totalPages}
        selectedDay={selectedDay}
        />

      {/* Render the new client component for historial */}
      <HistorialAsignacionesTable historial={historial} />
    </div>
  );
}