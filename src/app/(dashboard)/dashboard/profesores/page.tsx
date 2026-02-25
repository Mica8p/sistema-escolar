import { ProfesorService } from "@/service/profesor.service";
import { AlumnoService } from "@/service/alumno.service";
import { Briefcase, History, Clock, Trash2 } from "lucide-react";
import FormAsignacion from "./FormAsignacion";
import { getCicloActual } from "@/lib/ciclo-session";
import db from "@/lib/db";
import { ImportarAsignaciones } from "@/components/modules/profesores/ImportarAsignaciones";
import { AsignacionesList } from "./AsignacionesList";
import { borrarErrorAsignacionAction } from "@/lib/actions/profesor-actions";
import DeleteErrorButton from "@/components/modules/profesores/DeleteErrorButton";
import ReincorporarButton from "@/components/modules/profesores/ReincorporarButton";

interface PageProps {
  searchParams: Promise<{ editId?: string }>;
}

export default async function DocentesPage({ searchParams }: PageProps) {
  const { editId } = await searchParams;

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
        <h2 className="text-xl font-bold text-slate-500 flex items-center gap-2 px-2 italic">
          <History className="h-6 w-6 text-slate-400" />
          Memoria Académica (Bajas y Reemplazos)
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ex Docente</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Materia / Curso</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historial.map((reg) => (
                <tr key={reg.idAsignacion} className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="text-slate-700 font-semibold">{reg.profesor.persona.apellido}, {reg.profesor.persona.nombre}</p>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {reg.materia.nombre} — {reg.curso.grado}° {reg.curso.seccion} ({reg.curso.turno})
                    </span>
                  </td>
                  <td className="p-4 text-center flex items-center justify-center gap-3">
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-[9px] font-black rounded-lg uppercase tracking-tighter">HISTÓRICO</span>

                    <ReincorporarButton
                      id={reg.idAsignacion}
                      profeNombre={`${reg.profesor.persona.apellido}, ${reg.profesor.persona.nombre}`}
                    />

                    <DeleteErrorButton id={reg.idAsignacion} />
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