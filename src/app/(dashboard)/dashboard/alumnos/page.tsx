import { AlumnoService } from "@/service/alumno.service";
import { GraduationCap } from "lucide-react";
import { getCicloActual } from "@/lib/ciclo-session";
import { CicloService } from "@/service/ciclo.service";
import { InscripcionForm } from "@/components/modules/alumnos/InscripcionForm";
import DeleteMatriculaButton from "@/components/modules/alumnos/DeleteMatriculaButton";
import Link from "next/link";
import { EstadoAcademico } from "@prisma/client";
import { StatusFilter } from "@/components/modules/alumnos/StatusFilter";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

const StatusBadge = ({ estado }: { estado: EstadoAcademico }) => {
  const baseClasses = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
  const statusStyles: Record<EstadoAcademico, string> = {
    Activo: "bg-green-100 text-green-800",
    Retirado: "bg-red-100 text-red-800",
    Egresado: "bg-blue-100 text-blue-800",
    Suspendido: "bg-yellow-100 text-yellow-800",
  };
  return <span className={cn(baseClasses, statusStyles[estado])}>{estado}</span>;
}


export default async function AlumnosPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const { estado } = (await (searchParams as any)) || {};
  const cicloId = await getCicloActual();

  const currentStatusParam = estado;
  const validStatuses = Object.values(EstadoAcademico);
  
  let statusToFilter: EstadoAcademico | undefined;
  
  if (currentStatusParam === undefined) {
    statusToFilter = EstadoAcademico.Activo;
  } else if (validStatuses.includes(currentStatusParam as EstadoAcademico)) {
    statusToFilter = currentStatusParam as EstadoAcademico;
  }
  // If param is 'Todos' or invalid, statusToFilter remains undefined, so the service fetches all.

  const [alumnos, personasSinInscribir, cursos, cicloActivo] = await Promise.all([
    AlumnoService.getAll(cicloId, statusToFilter),
    AlumnoService.getPersonasDisponibles(cicloId),
    AlumnoService.getCursosDisponibles(),
    CicloService.getActive(),
  ]);

  const puedeInscribir = cicloActivo?.idCiclo === cicloId;
  const activeFilter = statusToFilter || 'Todos';


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

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">Listado de Alumnos Inscriptos</h2>
          <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded">
            Total: {alumnos.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="p-4">Legajo</th>
                <th className="p-4">Apellido y Nombre</th>
                <th className="p-4">DNI</th>
                <th className="p-4">Curso y Turno</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alumnos.length > 0 ? (
                alumnos.map((alumno) => {
                  const matriculaActual = alumno.matriculas[0];
                  return (
                    <tr key={alumno.idAlumno} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-sm text-blue-600">{alumno.legajo}</td>
                      <td className="p-4 font-medium text-gray-800 uppercase">
                        {alumno.persona.apellido}, {alumno.persona.nombre}
                      </td>
                      <td className="p-4 text-gray-600">{alumno.persona.dni}</td>
                      <td className="p-4">
                        {matriculaActual ? (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            matriculaActual.curso.turno === 'Mañana'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {matriculaActual.curso.grado}° "{matriculaActual.curso.seccion}" - {matriculaActual.curso.turno}
                          </span>
                        ) : (
                          <span className="text-red-500 text-xs italic">Sin matrícula</span>
                        )}
                      </td>
                      <td className="p-4">
                        {matriculaActual && <StatusBadge estado={matriculaActual.estadoAcademico} />}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <Link href={`/dashboard/alumnos/${alumno.idAlumno}`} className="text-blue-500 hover:text-blue-700 text-xs font-bold">
                          Ver Perfil
                        </Link>
                        {matriculaActual && (
                          <>
                            <span className="text-gray-300">|</span>
                            <DeleteMatriculaButton idMatricula={matriculaActual.idMatricula} />
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 italic">
                    No hay alumnos que coincidan con el estado seleccionado en este ciclo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}