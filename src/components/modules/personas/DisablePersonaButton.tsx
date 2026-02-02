"use client";

import { Ban } from "lucide-react";
import { useTransition } from "react";
import { inhabilitarAccesoAction } from "@/lib/actions/persona-actions";

interface DisablePersonaButtonProps {
  idPersona: number;
  rol: string; // Ej: "ADMIN", "DOCENTE", "PADRE", "ALUMNO"
  disabled?: boolean; // Para deshabilitarlo visualmente si ya está inactivo
}

export default function DisablePersonaButton({ idPersona, rol, disabled }: DisablePersonaButtonProps) {
  const [isPending, startTransition] = useTransition();

  // Lógica solicitada: No mostrar el botón si es ALUMNO
  if (rol === "ALUMNO") return null;

  const handleDisable = () => {
    if (!confirm("¿Estás seguro de que querés inhabilitar el acceso a este usuario?")) return;

    startTransition(async () => {
      const res = await inhabilitarAccesoAction(idPersona);
      alert(res.message);
    });
  };

  return (
    <button
      onClick={handleDisable}
      disabled={isPending || disabled}
      className={`p-2 rounded-full transition-colors ${
        disabled 
          ? "text-gray-300 cursor-not-allowed" 
          : "text-amber-600 hover:bg-amber-50"
      }`}
      title={disabled ? "Usuario ya inhabilitado" : "Inhabilitar Acceso"}
    >
      <Ban size={20} />
    </button>
  );
}