"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { asignarDocenteAction, editarDocenteAction, FormState } from "@/lib/actions/profesor-actions";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { getHorariosPorCurso, getHorarios } from "@/lib/actions/horario-actions";
import { BloqueHorario, DiaHabil } from "@prisma/client";
import HorarioMatrix from "./HorarioMatrix";

interface Props {
  personas: any[];
  materias: any[];
  cursos: any[];
  editData?: any; // Recibe la asignación a editar si existe
  idCiclo: number;
  diasHabiles: DiaHabil[];
  bloquesHorario: BloqueHorario[];
}

const initialState: FormState = {};

export default function FormAsignacion({ personas, materias, cursos, editData, idCiclo, diasHabiles, bloquesHorario }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [horario, setHorario] = useState<any[]>([]);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<number | null>(editData?.idCurso || null);
  const [selectedSlots, setSelectedSlots] = useState<{ dia: string, hora: string }[]>([]);

  // Si hay editData, usamos la acción de editar; si no, la de asignar
  const actionToUse = editData ? editarDocenteAction : asignarDocenteAction;
  const [state, formAction, isPending] = useActionState(actionToUse, initialState);

  useEffect(() => {
    if (state.success && !editData) {
      setSelectedCurso(null);
      setSelectedSlots([]);
      formRef.current?.reset();
    }
  }, [state, editData]);

  useEffect(() => {
    if (editData) {
      getHorarios(editData.idAsignacion).then(horarios => {
        const slots = horarios.map(h => ({
          dia: h.diaSemana,
          hora: `${h.horaInicio} - ${h.horaFin}`
        }));
        setSelectedSlots(slots);
      });
    }
  }, [editData]);

  useEffect(() => {
    if (selectedCurso) {
      setLoadingHorario(true);
      getHorariosPorCurso(selectedCurso, idCiclo)
        .then(setHorario)
        .finally(() => setLoadingHorario(false));
    } else {
      setHorario([]);
    }
    if (!editData) {
      setSelectedSlots([]); // Reset slot selection when course changes
    }
  }, [selectedCurso, idCiclo, editData]);

  const handleSlotSelect = (dia: string, hora: string) => {
    setSelectedSlots(prev => {
      const index = prev.findIndex(slot => slot.dia === dia && slot.hora === hora);
      if (index > -1) {
        return prev.filter((_, i) => i !== index);
      } else {
        return [...prev, { dia, hora }];
      }
    });
  };

  const cancelarEdicion = () => {
    router.push("/dashboard/profesores");
  };

  const cursoSeleccionado = cursos.find(c => c.idCurso === selectedCurso);

  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${
      editData ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          {editData ? "📝 Corregir Asignación" : "➕ Asignar Materia a Docente"}
        </h2>
        {editData && (
          <button onClick={cancelarEdicion} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {state.error}
        </div>
      )}

      <form ref={formRef} action={formAction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* CAMPO OCULTO PARA EL CICLO */}
        <input type="hidden" name="idCiclo" value={idCiclo} />
        {/* Campo oculto para saber qué ID estamos editando */}
        {editData && <input type="hidden" name="idAsignacion" value={editData.idAsignacion} />}
        {selectedSlots.map((slot, i) => (
          <input type="hidden" name={`slots[${i}]dia`} value={slot.dia} key={`${i}-dia`} />
        ))}
        {selectedSlots.map((slot, i) => (
          <input type="hidden" name={`slots[${i}]hora`} value={slot.hora} key={`${i}-hora`} />
        ))}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Docente</label>
          <select
            name="idPersona"
            required
            disabled={!!editData} // No se cambia el docente, solo su materia/curso
            defaultValue={editData?.profesor?.idPersona || ""}
            className="w-full p-2 border rounded-md bg-white disabled:bg-gray-100 text-gray-600"
          >
            <option value="">Seleccionar...</option>
            {editData ? (
                <option value={editData.profesor?.idPersona}>
                  {editData.profesor?.persona?.apellido}, {editData.profesor?.persona?.nombre}
                </option>
            ) : (
              personas.map(p => (
                <option key={p.idPersona} value={p.idPersona}>{p.apellido}, {p.nombre}</option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Materia</label>
          <select
            name="idMateria"
            required
            key={editData?.idMateria} // Fuerza el refresco del valor al cambiar de edición
            defaultValue={editData?.idMateria || ""}
            className="w-full p-2 border rounded-md bg-white text-gray-600"
          >
            <option value="">Seleccionar...</option>
            {materias.map(m => <option key={m.idMateria} value={m.idMateria}>{m.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Curso</label>
          <select
            name="idCurso"
            required
            key={editData?.idCurso}
            defaultValue={editData?.idCurso || ""}
            className="w-full p-2 border rounded-md bg-white text-gray-600"
            onChange={(e) => setSelectedCurso(Number(e.target.value))}
          >
            <option value="">Seleccionar...</option>
            {cursos.map(c => <option key={c.idCurso} value={c.idCurso}>{c.grado}° "{c.seccion}" - {c.turno}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className={`flex-1 font-bold py-2 rounded-md transition-colors ${
              editData ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isPending ? "Guardando..." : editData ? "Actualizar" : "Asignar"}
          </button>

          {editData && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-bold hover:bg-gray-300"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {selectedCurso && cursoSeleccionado && (
        <HorarioMatrix
          horario={horario}
          turno={cursoSeleccionado.turno}
          loading={loadingHorario}
          onSlotSelect={handleSlotSelect}
          selectedSlots={selectedSlots}
          idAsignacionActual={editData?.idAsignacion}
          diasHabiles={diasHabiles}
          bloquesHorario={bloquesHorario}
        />
      )}
    </div>
  );
}
