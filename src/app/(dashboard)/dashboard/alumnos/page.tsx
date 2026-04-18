import { AlumnoService } from "@/service/alumno.service";
import { GraduationCap } from "lucide-react";
import { getCicloActual } from "@/lib/ciclo-session";
import { CicloService } from "@/service/ciclo.service";
import { InscripcionForm } from "@/components/modules/alumnos/InscripcionForm";
import { EstadoAcademico } from "@prisma/client";
import { StatusFilter } from "@/components/modules/alumnos/StatusFilter";
import { AlumnosClient } from "@/components/modules/alumnos/AlumnosClient";

export const dynamic = 'force-dynamic';

export default async function AlumnosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const cicloId = await getCicloActual();

  const currentStatusParam = estado;
  const validStatuses = Object.values(EstadoAcademico);

  let statusToFilter: EstadoAcademico | undefined;

  if (currentStatusParam === undefined) {
    statusToFilter = EstadoAcademico.Activo;
  } else if (validStatuses.includes(currentStatusParam as EstadoAcademico)) {
    statusToFilter = currentStatusParam as EstadoAcademico;
  }

  const [alumnos, personasSinInscribir, cursos, cicloActivo] = await Promise.all([
    AlumnoService.getAll(cicloId, statusToFilter),
    AlumnoService.getPersonasDisponibles(cicloId),
    AlumnoService.getCursosDisponibles(),
    CicloService.getActive(),
  ]);

  const puedeInscribir = cicloActivo?.idCiclo === cicloId;
  const activeFilter = statusToFilter || EstadoAcademico.Activo;


  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <GraduationCap className="h-8 w-8 text-blue-600" />
        Gestión de Alumnos
      </h1>

      {puedeInscribir ? (
        <InscripcionForm personas={personasSinInscribir} cursos={cursos} />
      ) : (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg border border-yellow-200 shadow-sm">
          <p className="font-semibold">La inscripción solo está permitida en el ciclo lectivo activo.</p>
          <p className="text-sm">Cambiá el año en el selector superior para ver otros listados.</p>
        </div>
      )}

      <StatusFilter currentStatus={activeFilter} />

      <AlumnosClient alumnos={alumnos} />
    </div>
  );
}