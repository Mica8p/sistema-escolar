'use client';

import { useActionState } from 'react';
import { inscribirAlumnoAction } from "@/lib/actions/alumno-actions";
import { UserPlus } from "lucide-react";

import { Persona, Curso } from "@prisma/client";

interface InscripcionFormProps {
  personas: Persona[];
  cursos: Curso[];
}

export function InscripcionForm({ personas, cursos }: InscripcionFormProps) {
  const [state, formAction, isPending] = useActionState(inscribirAlumnoAction, null);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
        <UserPlus className="h-5 w-5" />
        Nueva Inscripción
      </h2>

      <form action={formAction} className="flex flex-wrap items-end gap-4">
        {/* Selector de Personas */}
        <div className="flex-1 min-w-[250px">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Alumno (Persona)
          </label>
          <select
            name="idPersona"
            required
            className="w-full p-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Elegir Persona --</option>
            {personas.map((p) => (
              <option key={p.idPersona} value={p.idPersona}>
                {p.apellido}, {p.nombre} (DNI: {p.dni})
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Cursos */}
        <div className="flex-1 min-w-[250px">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Curso Inicial
          </label>
          <select
            name="idCurso"
            required
            className="w-full p-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Elegir Curso --</option>
            {cursos.map((c) => (
              <option key={c.idCurso} value={c.idCurso}>
                {c.grado}° &quot;{c.seccion}&quot; - {c.nivel} ({c.turno})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending || personas.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-gray-400 h-[42px"
        >
          {isPending ? 'Inscribiendo...' : 'Inscribir'}
        </button>
      </form>

      {personas.length === 0 && (
        <p className="text-sm text-orange-600 mt-3 font-medium animate-pulse">
          * No hay personas nuevas con rol &apos;ALUMNO&apos; para inscribir. Cargá más personas primero.
        </p>
      )}

      {cursos.length === 0 && (
        <p className="text-sm text-red-600 mt-2 font-medium">
          * ¡Atención! No hay cursos cargados.
        </p>
      )}

      {state?.error && <p className="text-red-500 text-sm mt-2 font-bold">{state.error}</p>}
      {state?.success && <p className="text-green-600 text-sm mt-2 font-bold italic">¡Inscripción procesada con éxito!</p>}
    </div>
  );
}