"use client";

import { cambiarEstadoMatriculaAction } from "@/lib/actions/alumno-actions";
import { EstadoAcademico } from "@prisma/client";

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

  const action = cambiarEstadoMatriculaAction.bind(
    null,
    idMatricula,
    estadoActual === 'Activo' ? 'Suspendido' : 'Activo',
    path
  );

  const isActivo = estadoActual === "Activo";
  const buttonText = isActivo ? "Suspender Alumno" : "Reactivar Alumno";
  const buttonClass = isActivo
    ? "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
    : "bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors";


  if (estadoActual !== 'Activo' && estadoActual !== 'Suspendido') {
    return null; // Don't show the button for 'Retirado' or 'Egresado'
  }

  return (
    <form action={action}>
      <button type="submit" className={buttonClass}>
        {buttonText}
      </button>
    </form>
  );
}
