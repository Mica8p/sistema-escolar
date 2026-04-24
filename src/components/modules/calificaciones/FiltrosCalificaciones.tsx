"use client";

import { AsignacionAcademica, Turno } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";

interface FiltrosCalificacionesProps {
  cursos: { key: string; label: string }[];
  turnos: string[];
  asignaciones: (AsignacionAcademica & {
    materia: { nombre: string };
    curso: { grado: string; seccion: string };
  })[];
  cursoKey?: string;
  turno?: Turno;
  idAsignacion?: number;
}

export default function FiltrosCalificaciones({
  cursos,
  turnos,
  asignaciones,
  cursoKey,
  turno,
  idAsignacion,
}: FiltrosCalificacionesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // When curso or turno changes, reset materia and pagination
    if (key === "curso" || key === "turno") {
      params.delete("asig");
      params.set("page", "1");
    }
     if (key === "asig") {
      params.set("page", "1");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label
          htmlFor="curso"
          className="block text-sm font-medium text-gray-700"
        >
          Curso
        </label>
        <select
          id="curso"
          name="curso"
          className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
          onChange={(e) => handleFilterChange("curso", e.target.value)}
          value={cursoKey || ""}
        >
          <option value="">-- Seleccione el curso --</option>
          {cursos.map((curso) => (
            <option key={curso.key} value={curso.key}>
              {curso.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="turno"
          className="block text-sm font-medium text-gray-700"
        >
          Turno
        </label>
        <select
          id="turno"
          name="turno"
          className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
          onChange={(e) => handleFilterChange("turno", e.target.value)}
          value={turno || ""}
        >
          <option value="">-- Seleccione el turno --</option>
          {turnos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="asignacion"
          className="block text-sm font-medium text-gray-700"
        >
          Materia
        </label>
        <select
          id="asignacion"
          name="asignacion"
          disabled={asignaciones.length === 0}
          className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all disabled:bg-slate-200"
          onChange={(e) => handleFilterChange("asig", e.target.value)}
          value={idAsignacion || ""}
        >
          <option value="">Seleccione una materia</option>
          {asignaciones.map((asig) => (
            <option key={asig.idAsignacion} value={asig.idAsignacion}>
              {asig.materia.nombre} ({asig.curso.grado}° {asig.curso.seccion})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
