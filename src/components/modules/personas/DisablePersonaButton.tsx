"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";
import { inhabilitarAccesoAction } from "@/lib/actions/persona-actions";
import { toast } from "sonner";
import ConfirmModal  from "@/components/shared/ConfirmModal";

interface DisablePersonaButtonProps {
  idPersona: number;
  rol: string;
  disabled?: boolean;
}

export default function DisablePersonaButton({ idPersona, rol, disabled }: DisablePersonaButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  if (rol === "ALUMNO") return null;

  const handleDisable = () => {
    startTransition(async () => {
      try {
        const res = await inhabilitarAccesoAction(idPersona);
        if (res.success) {
          toast.success(res.message);
          setIsOpen(false);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Error al intentar inhabilitar al usuario.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
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

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDisable}
        title="Inhabilitar Acceso"
        message="¿Estás seguro de que querés quitarle el acceso a este usuario? Ya no podrá loguearse al sistema."
        loading={isPending}
        variant="warning"
      />
    </>
  );
}