import { inscribirAlumnoAction } from "@/lib/actions/alumno-actions";
import { AlumnoService } from "@/service/alumno.service";
import { UserPlus, GraduationCap } from "lucide-react"; // Iconos bonitos
import { getCicloActual } from "@/lib/ciclo-session";
import { CicloService } from "@/service/ciclo.service";

export default async function AlumnosPage() {
  const cicloId = await getCicloActual();
  // 1. Obtenemos todos los datos necesarios al mismo tiempo (en paralelo)
  const [alumnos, personasSinInscribir, cursos, cicloActivo] = await Promise.all([
    AlumnoService.getAll(cicloId),
    AlumnoService.getPersonasDisponibles(cicloId),
    AlumnoService.getCursosDisponibles(),
    CicloService.getActive(),
  ]);

  const puedeInscribir = cicloActivo?.idCiclo === cicloId;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <GraduationCap className="h-8 w-8 text-blue-600" />
        Gestión de Alumnos
      </h1>

      {/* === SECCIÓN 1: FORMULARIO DE INSCRIPCIÓN === */}
      {puedeInscribir ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <UserPlus className="h-5 w-5" />
            Nueva Inscripción
          </h2>

          <form action={inscribirAlumnoAction} className="flex flex-wrap items-end gap-4">
            {/* Selector de Personas */}
            <div className="flex-1 min-w-250px">
              <label htmlFor="idPersona" className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Alumno (Persona)
              </label>
              <select
                name="idPersona"
                id="idPersona"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">-- Elegir Persona --</option>
                {personasSinInscribir.map((p) => (
                  <option key={p.idPersona} value={p.idPersona}>
                    {p.apellido}, {p.nombre} (DNI: {p.dni})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Cursos */}
            <div className="flex-1 min-w-250px">
              <label htmlFor="idCurso" className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Curso Inicial
              </label>
              <select
                name="idCurso"
                id="idCurso"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">-- Elegir Curso --</option>
                {cursos.map((c) => (
                  <option key={c.idCurso} value={c.idCurso}>
                    {c.grado}° "{c.seccion}" - {c.nivel}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors h-42px"
            >
              Inscribir
            </button>
          </form>

          {personasSinInscribir.length === 0 && (
            <p className="text-sm text-orange-600 mt-2">
              * No hay personas nuevas con rol 'ALUMNO' para inscribir. Cargá más personas primero.
            </p>
          )}
          {cursos.length === 0 && (
            <p className="text-sm text-red-600 mt-2">
              * ¡Atención! No hay cursos cargados. Dile a Gabriel que se apure 😄.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md border border-yellow-200">
          <p className="font-semibold">
            La inscripción de alumnos solo está permitida en el ciclo lectivo activo.
          </p>
          <p>Para inscribir, por favor seleccioná el ciclo lectivo activo o activá el ciclo deseado en la sección de configuraciones.</p>
        </div>
      )}

      {/* === SECCIÓN 2: TABLA DE LISTADO === */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="p-4 bg-gray-100 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Listado de Alumnos Inscriptos</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-700 uppercase text-sm font-semibold">
              <tr>
                <th className="p-4">Legajo</th>
                <th className="p-4">Apellido y Nombre</th>
                <th className="p-4">DNI</th>
                <th className="p-4">Curso Actual</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alumnos.length > 0 ? (
                alumnos.map((alumno) => {
                   // Tomamos la matrícula más reciente (si existe)
                  const matriculaActual = alumno.matriculas[0];
                  return (
                  <tr key={alumno.idAlumno} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-blue-600">{alumno.legajo}</td>
                    <td className="p-4 font-medium text-gray-800">
                      {alumno.persona.apellido}, {alumno.persona.nombre}
                    </td>
                    <td className="p-4 text-gray-600">{alumno.persona.dni}</td>
                    <td className="p-4">
                      {matriculaActual ? (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {matriculaActual.curso.grado}° "{matriculaActual.curso.seccion}" ({matriculaActual.curso.nivel})
                        </span>
                      ) : (
                        <span className="text-red-500 text-sm">Sin curso asignado</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-gray-500 hover:text-blue-600 text-sm font-medium">
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    No hay alumnos inscriptos todavía. ¡Usá el formulario de arriba!
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