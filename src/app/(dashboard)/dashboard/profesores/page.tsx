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

  let cicloActualInfo = await db.cicloLectivo.findUnique({ where: { idCiclo: idCicloActual } });

  if (!cicloActualInfo) {
    const cicloFallback = await db.cicloLectivo.findFirst({
      where: { estado: true },
      orderBy: { anio: 'desc' }
    });
    if (cicloFallback) {
      idCicloActual = cicloFallback.idCiclo;
      cicloActualInfo = cicloFallback;
    }
  }

  const cicloAnterior = await db.cicloLectivo.findFirst({
    where: { anio: (cicloActualInfo?.anio ?? 0) - 1 },
  });

  const { profesores, total } = await ProfesorService.getAllByDay(idCicloActual, selectedDay, currentPage, limit);

  const [personas, materias, cursos, historial, diasHabiles, bloquesHorario] = await Promise.all([
    ProfesorService.getPersonasDisponibles(),
    ProfesorService.getMaterias(),
    AlumnoService.getCursosDisponibles(),
    ProfesorService.getHistorialAsignaciones(),
    db.diaHabil.findMany({ where: { habilitado: true }, orderBy: { orden: 'asc' } }),
    db.bloqueHorario.findMany({ orderBy: { orden: 'asc' } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const asignacionAEditar = editId 
    ? await db.asignacionAcademica.findUnique({ 
        where: { idAsignacion: Number(editId) },
        include: {
          horarios: true,
          materia: true,
          curso: true,
          profesor: { include: { persona: true } }
        }
      }) 
    : null;

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
        editData={asignacionAEditar as any}
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