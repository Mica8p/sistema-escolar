"use client";

import { useFormState } from "react-dom";
import { createPeriodoAction, deletePeriodoAction } from "@/lib/actions/periodo-actions";
import { PeriodoAcademico, PeriodoNombre } from "@prisma/client";
import { Trash2, PlusCircle, Calendar } from "lucide-react";

interface Props {
  idCiclo: number;
  periodos: PeriodoAcademico[];
}

const initialState = { success: false, message: "" };

export default function PeriodosManager({ idCiclo, periodos }: Props) {
  const [state, formAction] = useFormState(createPeriodoAction, initialState);

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Calendar size={16} /> Trimestres y Periodos
      </h4>

      {/* Lista de Periodos Existentes */}
      <div className="space-y-2 mb-4">
        {periodos.length === 0 && (
          <p className="text-xs text-gray-500 italic">No hay periodos configurados.</p>
        )}
        
        {periodos.map((p) => (
          <div key={p.idPeriodo} className="flex items-center justify-between bg-gray-50 p-2 rounded border text-sm">
            <div>
              <span className="font-medium block text-gray-800">{p.nombre}</span>
              <span className="text-xs text-gray-500">
                {new Date(p.fechaInicio).toLocaleDateString()} - {new Date(p.fechaFin).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={async () => {
                if (confirm("¿Seguro que querés borrar este periodo?")) {
                  await deletePeriodoAction(p.idPeriodo);
                }
              }}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
              title="Eliminar periodo"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Formulario para agregar nuevo */}
      <form action={formAction} className="bg-blue-50 p-3 rounded border border-blue-100">
        <div className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1">
          <PlusCircle size={14} /> Nuevo Periodo
        </div>
        
        <input type="hidden" name="idCiclo" value={idCiclo} />

        <div className="grid grid-cols-1 gap-2 mb-2">
          <select name="nombre" className="w-full border rounded p-1.5 text-xs text-gray-900" required>
            <option value="">-- Seleccionar Tipo --</option>
            <option value={PeriodoNombre.TRIMESTRE_1}>1er Trimestre</option>
            <option value={PeriodoNombre.TRIMESTRE_2}>2do Trimestre</option>
            <option value={PeriodoNombre.TRIMESTRE_3}>3er Trimestre</option>
            <option value={PeriodoNombre.DICIEMBRE}>Diciembre (Recuperatorio)</option>
            <option value={PeriodoNombre.FEBRERO}>Febrero (Recuperatorio)</option>
          </select>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-600 mb-0.5">Inicio</label>
              <input type="date" name="fechaInicio" className="w-full border rounded p-1 text-xs text-gray-900" required />
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-0.5">Fin</label>
              <input type="date" name="fechaFin" className="w-full border rounded p-1 text-xs text-gray-900" required />
            </div>
          </div>
        </div>

        {state?.message && (
          <p className={`text-xs mb-2 ${state.success ? "text-green-600" : "text-red-600"}`}>
            {state.message}
          </p>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-1.5 rounded text-xs hover:bg-blue-700 font-medium">
          Guardar
        </button>
      </form>
    </div>
  );
}