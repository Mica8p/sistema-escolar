"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  asignarDocenteAction,
  editarDocenteAction,
  FormState,
} from "@/lib/actions/profesor-actions";
import { useRouter } from "next/navigation";
import { AlertCircle, X } from "lucide-react";
import {
  getHorariosPorCurso,
  getHorarios,
  getHorariosPorPersona,
} from "@/lib/actions/horario-actions";
import { BloqueHorario, DiaHabil, Turno, DiaSemana } from "@prisma/client";
import HorarioMatrix from "./HorarioMatrix";

interface HorarioOcupado {
  idAsignacion: number;
  diaSemana: DiaSemana;
  asignacion: {
    materia: {
      nombre: string;
    };
    profesor?: {
      persona: {
        apellido: string;
      };
    };
    curso?: {
      grado: string;
      seccion: string;
    };
  };
  horaInicio: string;
  horaFin: string;
}

interface PersonaConProfesor {
  idPersona: number;
  nombre: string;
  apellido: string;
  profesor?: {
    idProfesor: number;
  };
}

interface MateriaSimple {
  idMateria: number;
  nombre: string;
}

interface CursoSimple {
  idCurso: number;
  grado: string;
  seccion: string;
  turno: string;
}

interface AsignacionEdit {
  idAsignacion: number;
  profesor?: {
    idPersona: number;
    persona: {
      nombre: string;
      apellido: string;
    };
  } | null;
  materia: {
    idMateria: number;
    nombre: string;
  };
  curso: {
    idCurso: number;
    grado: string;
    seccion: string;
  };
  estado: boolean;
}

interface Props {
  personas: PersonaConProfesor[];
  materias: MateriaSimple[];
  cursos: CursoSimple[];
  editData?: AsignacionEdit;
  idCiclo: number;
  diasHabiles: DiaHabil[];
  bloquesHorario: BloqueHorario[];
  esElCicloActivo: boolean;
}

const initialState: FormState = {};

export default function FormAsignacion({
  personas,
  materias,
  cursos,
  editData,
  idCiclo,
  diasHabiles,
  bloquesHorario,
  esElCicloActivo,
}: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [horario, setHorario] = useState<unknown[]>([]);
  const [horarioCurso, setHorarioCurso] = useState<unknown[]>([]);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<number | null>(
    editData?.curso?.idCurso || null
  );
  const [selectedProfesor, setSelectedProfesor] = useState<number | null>(
    editData?.profesor?.idPersona || null
  );
  const [selectedSlots, setSelectedSlots] = useState<
    { dia: DiaSemana; hora: string }[]
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const actionToUse = editData ? editarDocenteAction : asignarDocenteAction;
  const [state, formAction, isPending] = useActionState(
    actionToUse,
    initialState
  );

  useEffect(() => {
    if (state.success && !editData) {
      setSelectedCurso(null);
      setSelectedSlots([]);
      setSelectedProfesor(null);
      formRef.current?.reset();
      // Incrementar refresh key para recargar los horarios
      setRefreshKey(prev => prev + 1);
    }
  }, [state, editData]);

  // Efecto adicional para refrescar horarios cuando hay éxito
  useEffect(() => {
    if (state.success && selectedCurso && !editData) {
      const refreshHorarios = async () => {
        setLoadingHorario(true);
        try {
          const horarioCursoData = await getHorariosPorCurso(selectedCurso, idCiclo);
          setHorarioCurso(horarioCursoData);
        } catch (error) {
          console.error("Error refrescando horarios del curso:", error);
        } finally {
          setLoadingHorario(false);
        }
      };
      refreshHorarios();
    }
  }, [state.success, selectedCurso, idCiclo, editData]);

  useEffect(() => {
    if (editData) {
      getHorarios(editData.idAsignacion).then((horarios) => {
        const slots = horarios.map((h) => ({
          dia: h.diaSemana,
          hora: `${h.horaInicio} - ${h.horaFin}`,
        }));
        setSelectedSlots(slots);
      });
    }
  }, [editData]);

  useEffect(() => {
    const fetchHorarios = async () => {
      setLoadingHorario(true);
      try {
        // Obtener horarios del profesor desde su idPersona
        if (selectedProfesor) {
          const horarioDocente = await getHorariosPorPersona(selectedProfesor, idCiclo);
          setHorario(horarioDocente);
        } else {
          setHorario([]);
        }

        // Obtener horarios del curso
        if (selectedCurso) {
          const horarioCursoData = await getHorariosPorCurso(selectedCurso, idCiclo);
          setHorarioCurso(horarioCursoData);
        } else {
          setHorarioCurso([]);
        }
      } catch (error) {
        console.error("Error fetching horarios:", error);
        setHorario([]);
        setHorarioCurso([]);
      } finally {
        setLoadingHorario(false);
      }
    };
  
    fetchHorarios();
  
    if (!editData) {
      setSelectedSlots([]);
    }
  }, [selectedProfesor, selectedCurso, idCiclo, editData, refreshKey]);

  const handleSlotSelect = (dia: DiaSemana, hora: string) => {
    setSelectedSlots((prev) => {
      const index = prev.findIndex(
        (slot) => slot.dia === dia && slot.hora === hora
      );
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

  const cursoSeleccionado = cursos.find((c) => c.idCurso === selectedCurso);

  return (
    <div
      className={`p-6 rounded-xl border transition-all duration-300 ${
        editData
          ? "bg-blue-50 border-blue-300 shadow-md"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          {editData ? "📝 Corregir Asignación" : "➕ Asignar Materia a Docente"}
        </h2>
        {editData && (
          <button
            onClick={cancelarEdicion}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {state.error}
        </div>
      )}

      {!esElCicloActivo && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> 
          <span>Solo puedes crear asignaciones en el ciclo lectivo activo. Este es un ciclo archivado para consulta.</span>
        </div>
      )}

      <form
        ref={formRef}
        action={formAction}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <input type="hidden" name="idCiclo" value={idCiclo} />
        {editData && (
          <input type="hidden" name="idAsignacion" value={editData.idAsignacion} />
        )}
        {selectedSlots.map((slot, i) => (
          <input
            type="hidden"
            name={`slots[${i}]dia`}
            value={slot.dia}
            key={`${i}-dia`}
          />
        ))}
        {selectedSlots.map((slot, i) => (
          <input
            type="hidden"
            name={`slots[${i}]hora`}
            value={slot.hora}
            key={`${i}-hora`}
          />
        ))}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Docente
          </label>
          <select
            name="idPersona"
            required
            disabled={!!editData}
            value={selectedProfesor || ""}
            onChange={(e) => setSelectedProfesor(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-white disabled:bg-gray-100 text-gray-600"
          >
            <option value="">Seleccionar...</option>
            {editData ? (
                <option value={editData.profesor?.idPersona}>
                  {editData.profesor?.persona?.apellido},{" "}
                  {editData.profesor?.persona?.nombre}
                </option>
            ) : (
              personas.map((p) => (
                <option key={p.idPersona} value={p.idPersona}>
                  {p.apellido}, {p.nombre}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Materia
          </label>
          <select
            name="idMateria"
            required
            key={editData?.materia?.idMateria}
            defaultValue={editData?.materia?.idMateria || ""}
            className="w-full p-2 border rounded-md bg-white text-gray-600"
          >
            <option value="">Seleccionar...</option>
            {materias.map((m) => (
              <option key={m.idMateria} value={m.idMateria}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Curso
          </label>
          <select
            name="idCurso"
            required
            key={editData?.curso?.idCurso}
            defaultValue={editData?.curso?.idCurso || ""}
            className="w-full p-2 border rounded-md bg-white text-gray-600"
            onChange={(e) => setSelectedCurso(Number(e.target.value))}
          >
            <option value="">Seleccionar...</option>
            {[...new Map(cursos.map(c => [c.idCurso, c])).values()].map((c) => (
              <option key={c.idCurso} value={c.idCurso}>
                {c.grado}° &quot;{c.seccion}&quot; - {c.turno}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending || !esElCicloActivo}
            className={`flex-1 font-bold py-2 rounded-md transition-colors ${
              editData
                ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300"
                : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300"
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
          horarioProfesor={horario as HorarioOcupado[]}
          horarioCurso={horarioCurso as HorarioOcupado[]}
          turno={cursoSeleccionado.turno as Turno}
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
