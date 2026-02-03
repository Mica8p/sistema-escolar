import { ProfesorService } from "@/service/profesor.service";
import { AlumnoService } from "@/service/alumno.service";
import { Briefcase, History, Clock } from "lucide-react";
import FormAsignacion from "./FormAsignacion";
import { getCicloActual } from "@/lib/ciclo-session";
import db from "@/lib/db";
import { ImportarAsignaciones } from "@/components/modules/profesores/ImportarAsignaciones";
import { AsignacionesList } from "./AsignacionesList";

interface PageProps {
  searchParams: Promise<{ editId?: string }>;
}

export default async function DocentesPage({ searchParams }: PageProps) {
  const { editId } = await searchParams;

  let idCicloActual = await getCicloActual();

  let cicloActualInfo = await db.cicloLectivo.findUnique({ where: { idCiclo: idCicloActual } });

  // Si el ciclo de la sesión no existe (por el reset de DB), buscar uno válido automáticamente
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

  const [profesores, personas, materias, cursos, historial, diasHabiles, bloquesHorario] = await Promise.all([
    ProfesorService.getAll(idCicloActual),
    ProfesorService.getPersonasDisponibles(),
    ProfesorService.getMaterias(),
    AlumnoService.getCursosDisponibles(),
    ProfesorService.getHistorialAsignaciones(),
    db.diaHabil.findMany({ where: { habilitado: true }, orderBy: { orden: 'asc' } }),
    db.bloqueHorario.findMany({ orderBy: { orden: 'asc' } }),
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

      {cicloAnterior && (
          <ImportarAsignaciones
            cicloActualId={idCicloActual}
            cicloAnteriorId={cicloAnterior.idCiclo}
            anioAnterior={cicloAnterior.anio}
            yaTieneDatos={profesores.length > 0}
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

      <AsignacionesList profesores={profesores} />

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