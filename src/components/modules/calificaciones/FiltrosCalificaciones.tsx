"use client";

import { AsignacionAcademica, Turno } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface FiltrosCalificacionesProps {
  cursos: { key: string; label: string; turno: Turno }[];
  turnos: string[];
  asignaciones: (AsignacionAcademica & {
    materia: { nombre: string };
    curso: { grado: string; seccion: string; turno: Turno };
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

  // PASO 1: Filtrar cursos por turno seleccionado
  const cursosFiltrados = useMemo(() => {
    if (!turno) return [];
    return cursos.filter((curso) => curso.turno === turno);
  }, [cursos, turno]);

  // PASO 2: Filtrar asignaciones por turno Y curso seleccionados
  // IMPORTANTE: Solo mostrar materias cuando hay curso seleccionado
  const asignacionesFiltradas = useMemo(() => {
    // Si no hay curso, no hay materias disponibles
    if (!cursoKey) return [];

    let filtered = asignaciones;

    // Filtrar por turno
    if (turno) {
      filtered = filtered.filter((asig) => asig.curso.turno === turno);
    }

    // Filtrar por curso específico
    if (cursoKey) {
      const [grado, seccion] = cursoKey.split("-");
      filtered = filtered.filter(
        (asig) =>
          asig.curso.grado === grado && asig.curso.seccion === seccion
      );
    }

    return filtered;
  }, [asignaciones, turno, cursoKey]);

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
          htmlFor="curso"
          className="block text-sm font-medium text-gray-700"
        >
          Curso
        </label>
        <select
          id="curso"
          name="curso"
          disabled={!turno || cursosFiltrados.length === 0}
          className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
          onChange={(e) => handleFilterChange("curso", e.target.value)}
          value={cursoKey || ""}
        >
          <option value="">-- Seleccione el curso --</option>
          {cursosFiltrados.map((curso) => (
            <option key={curso.key} value={curso.key}>
              {curso.label}
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
          disabled={!cursoKey || asignacionesFiltradas.length === 0}
          className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
          onChange={(e) => handleFilterChange("asig", e.target.value)}
          value={idAsignacion ? String(idAsignacion) : ""}
        >
          <option value="">Seleccione una materia</option>
          {asignacionesFiltradas.map((asig) => (
            <option key={asig.idAsignacion} value={String(asig.idAsignacion)}>
              {asig.materia.nombre} ({asig.curso.grado}° {asig.curso.seccion})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
