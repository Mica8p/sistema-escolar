import { ProfesorService } from "@/service/profesor.service";
import { AlumnoService } from "@/service/alumno.service";
import { Briefcase, BookOpen, UserX, Pencil, History, Clock } from "lucide-react";
import FormAsignacion from "./FormAsignacion";
import { revalidatePath } from "next/cache";
import { getCicloActual } from "@/lib/ciclo-session";
import db from "@/lib/db";
import { ImportarAsignaciones } from "@/components/modules/profesores/ImportarAsignaciones";
import { AsignacionesList } from "./AsignacionesList";

interface PageProps {
  searchParams: { editId?: string };
}

export default async function DocentesPage({ searchParams }: PageProps) {
 const { editId } = searchParams;

  // 1. OBTENER EL CICLO ACTUAL DE LA SESIÓN
  const idCicloActual = await getCicloActual();

  // 2. BUSCAR EL CICLO ANTERIOR (para el botón de importar)
  const cicloActualInfo = await db.cicloLectivo.findUnique({ where: { idCiclo: idCicloActual } });
  const cicloAnterior = await db.cicloLectivo.findFirst({
    where: { anio: (cicloActualInfo?.anio ?? 0) - 1 },
  });

  // 3. PASAR EL idCicloActual AL SERVICE
  const [profesores, personas, materias, cursos, historial] = await Promise.all([
    ProfesorService.getAll(idCicloActual), // <--- AHORA FILTRA POR AÑO
    ProfesorService.getPersonasDisponibles(),
    ProfesorService.getMaterias(),
    AlumnoService.getCursosDisponibles(),
    ProfesorService.getHistorialAsignaciones(),
  ]);

  const asignacionAEditar = editId
    ? profesores.flatMap(p => p.asignaciones).find(a => a.idAsignacion === Number(editId))
    : null;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <Briefcase className="h-8 w-8 text-indigo-600" />
        Gestión de Docentes {cicloActualInfo?.anio}
      </h1>

      {/* 4. MOSTRAR BOTÓN DE IMPORTAR SI NO HAY ASIGNACIONES */}
      {profesores.length === 0 && cicloAnterior && (
        <ImportarAsignaciones
          cicloActualId={idCicloActual}
          cicloAnteriorId={cicloAnterior.idCiclo}
          anioAnterior={cicloAnterior.anio}
        />
      )}

      <FormAsignacion
        editData={asignacionAEditar}
        personas={personas}
        materias={materias}
        cursos={cursos}
        idCiclo={idCicloActual} // <--- PASAMOS EL ID AL FORMULARIO
      />

      {/* TABLA DE ASIGNACIONES ACTIVAS */}
      <AsignacionesList profesores={profesores} />

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
                      {reg.materia.nombre} — {reg.curso.grado}° {reg.curso.seccion} ({reg.curso.turno})
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