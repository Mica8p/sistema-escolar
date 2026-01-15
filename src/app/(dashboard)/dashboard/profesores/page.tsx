import { ProfesorService } from "@/service/profesor.service";
import { AlumnoService } from "@/service/alumno.service";
import { Briefcase, BookOpen, UserX, Pencil, History, Clock } from "lucide-react";
import FormAsignacion from "./FormAsignacion";
import { revalidatePath } from "next/cache";

interface PageProps {
  searchParams: Promise<{ editId?: string }>; // Next.js 15 maneja searchParams como Promise
}

export default async function DocentesPage({ searchParams }: PageProps) {
  const { editId } = await searchParams; // Obtenemos el ID de la URL si existe

  const [profesores, personas, materias, cursos, historial] = await Promise.all([
    ProfesorService.getAll(), // Trae solo activos
    ProfesorService.getPersonasDisponibles(),
    ProfesorService.getMaterias(),
    AlumnoService.getCursosDisponibles(),
    ProfesorService.getHistorialAsignaciones(), // Trae solo inactivos
  ]);

  // Si estamos editando, buscamos la asignación específica para pasarla al form
  const asignacionAEditar = editId
    ? profesores.flatMap(p => p.asignaciones).find(a => a.idAsignacion === Number(editId))
    : null;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <Briefcase className="h-8 w-8 text-indigo-600" />
        Gestión de Docentes
      </h1>

      {/* Formulario Dual */}
      <FormAsignacion
        editData={asignacionAEditar}
        personas={personas}
        materias={materias}
        cursos={cursos}
      />

      {/* TABLA DE ASIGNACIONES ACTIVAS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Docentes con Actividad Hoy</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase">
            <tr>
              <th className="p-4 w-1/4">Docente</th>
              <th className="p-4 w-1/2">Materias y Cursos</th>
              <th className="p-4 w-1/4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {profesores.map(profe => (
              <tr key={profe.idProfesor} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{profe.persona.apellido}, {profe.persona.nombre}</p>
                  <p className="text-xs text-gray-400">DNI: {profe.persona.dni}</p>
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {profe.asignaciones.map(asig => (
                      <span key={asig.idAsignacion} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-1 rounded-full border border-indigo-100">
                        <BookOpen size={12} />
                        {asig.materia.nombre} ({asig.curso.grado}° {asig.curso.seccion})
                      </span>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-col gap-2">
                    {profe.asignaciones.map(asig => (
                      <div key={asig.idAsignacion} className="flex items-center justify-center gap-4 py-1 border-b border-gray-50 last:border-0">
                        {/* Indicador de qué materia estamos editando/borrando en esta fila de acciones */}
                        <span className="text-[10px] text-gray-400 font-medium uppercase hidden xl:block">
                          {asig.materia.nombre}:
                        </span>

                        {/* BOTÓN EDITAR */}
                        <a
                          href={`?editId=${asig.idAsignacion}`}
                          className="text-blue-500 hover:text-blue-700 transition-transform hover:scale-110"
                          title={`Editar ${asig.materia.nombre}`}
                        >
                          <Pencil size={18} />
                        </a>

                        {/* BOTÓN BAJA */}
                        <form action={async () => {
                          "use server";
                          await ProfesorService.desactivarAsignacion(asig.idAsignacion);
                          revalidatePath("/dashboard/profesores");
                        }}>
                          <button
                            type="submit"
                            className="text-orange-500 hover:text-orange-700 transition-transform hover:scale-110"
                            title={`Dar de baja ${asig.materia.nombre}`}
                          >
                            <UserX size={18} />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN DE HISTORIAL */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-gray-400 flex items-center gap-2 px-2">
          <History className="h-6 w-6" />
          Memoria Académica (Bajas y Reemplazos)
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left opacity-70">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Ex Docente</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Materia / Curso</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {historial.map((reg) => (
                <tr key={reg.idAsignacion} className="bg-gray-50/30">
                  <td className="p-4">
                    <p className="text-gray-600 font-medium">{reg.profesor.persona.apellido}, {reg.profesor.persona.nombre}</p>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {reg.materia.nombre} — {reg.curso.grado}° {reg.curso.seccion}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-gray-200 text-gray-500 text-[10px] font-bold rounded">HISTÓRICO</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}