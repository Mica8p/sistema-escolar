"use client";

import { TipoEvaluacion } from "@prisma/client";
import { guardarNotaAction } from "@/lib/actions/calificaciones-actions";

export default function CalificacionesTable(props: {
  idAsignacion: number;
  idPeriodo: number;
  tipo: TipoEvaluacion;
  matriculas: any[];
  notaByMatricula: [number, any][];
}) {
  const notaMap = new Map<number, any>(props.notaByMatricula);

  return (
    <div className="border rounded overflow-auto">
      <div className="p-3 border-b bg-gray-50 text-sm">
        <span className="font-medium">Planilla:</span> cargá/modificá la nota y guardá por alumno.
      </div>

      <table className="min-w-[900px] w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Alumno</th>
            <th className="text-left p-2">Legajo</th>
            <th className="text-left p-2 w-[140px]">Nota</th>
            <th className="text-left p-2">Observación</th>
            <th className="text-left p-2 w-[120px]">Acción</th>
          </tr>
        </thead>

        <tbody>
          {props.matriculas.map((m) => {
            const n = notaMap.get(m.idMatricula);

            return (
              <tr key={m.idMatricula} className="border-b align-top">
                <td className="p-2">
                  <div className="font-medium">
                    {m.alumno.persona.apellido}, {m.alumno.persona.nombre}
                  </div>
                  <div className="text-xs text-gray-600">
                    Matrícula #{m.idMatricula}
                  </div>
                </td>

                <td className="p-2">{m.alumno.legajo}</td>

                <td className="p-2">
                  <input
                    form={`f-${m.idMatricula}`}
                    name="nota"
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    defaultValue={n?.nota ?? ""}
                    className="border rounded px-2 py-1 w-28"
                    placeholder="0-10"
                  />
                </td>

                <td className="p-2">
                  <input
                    form={`f-${m.idMatricula}`}
                    name="observacion"
                    defaultValue={n?.observacion ?? ""}
                    className="border rounded px-2 py-1 w-full min-w-[360px]"
                    placeholder="Opcional (ej: faltó a parcial, justificó, etc.)"
                  />
                  {n?.updatedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Últ. act.: {new Date(n.updatedAt).toLocaleString()}
                    </div>
                  )}
                </td>

                <td className="p-2">
                  <form id={`f-${m.idMatricula}`} action={guardarNotaAction} className="space-y-2">
                    <input type="hidden" name="idMatricula" value={m.idMatricula} />
                    <input type="hidden" name="idAsignacion" value={props.idAsignacion} />
                    <input type="hidden" name="idPeriodo" value={props.idPeriodo} />
                    <input type="hidden" name="tipo" value={props.tipo} />

                    <button className="bg-blue-600 text-white px-3 py-1 rounded w-full">
                      Guardar
                    </button>

                    <div className="text-xs text-gray-600">
                      {n ? "Editando" : "Nueva"}
                    </div>
                  </form>
                </td>
              </tr>
            );
          })}

          {props.matriculas.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-sm text-gray-600">
                No hay alumnos activos matriculados en este curso/ciclo.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
