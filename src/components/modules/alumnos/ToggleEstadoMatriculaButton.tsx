"use client";

import { cambiarEstadoMatriculaAction } from "@/lib/actions/alumno-actions";
import { EstadoAcademico } from "@prisma/client";
import { useState } from "react";

interface ToggleEstadoMatriculaButtonProps {
  idMatricula: number;
  estadoActual: EstadoAcademico;
  path: string;
}

export function ToggleEstadoMatriculaButton({
  idMatricula,
  estadoActual,
  path,
}: ToggleEstadoMatriculaButtonProps) {

  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const nuevoEstado = estadoActual === 'Activo' ? 'Suspendido' : 'Activo';
      await cambiarEstadoMatriculaAction(idMatricula, nuevoEstado, path);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActivo = estadoActual === "Activo";
  const buttonText = isActivo ? "Suspender Alumno" : "Reactivar Alumno";
  const buttonClass = isActivo
    ? "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
    : "bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors";


  if (estadoActual !== 'Activo' && estadoActual !== 'Suspendido') {
    return null;
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isLoading}
      className={buttonClass + (isLoading ? " opacity-50 cursor-not-allowed" : "")}
    >
      {isLoading ? "Procesando..." : buttonText}
    </button>
  );
}
