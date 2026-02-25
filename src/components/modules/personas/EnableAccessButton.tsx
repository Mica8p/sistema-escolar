"use client";

import { useState, useTransition } from "react";
import { habilitarAccesoAction } from "@/lib/actions/persona-actions";
import { KeyRound, LockKeyholeOpen } from "lucide-react";
import { toast } from "sonner";
import  ConfirmModal  from "@/components/shared/ConfirmModal";

interface Props {
  idPersona: number;
  dni: string;
  isActive: boolean;
}

export default function EnableAccessButton({ idPersona, dni, isActive }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const actionTitle = isActive ? "Restablecer Contraseña" : "Habilitar Acceso";
  const actionDescription = isActive
    ? `¿Deseas restablecer la contraseña del usuario con DNI ${dni}? La nueva clave será el número de DNI.`
    : `¿Deseas dar de alta el acceso para el usuario con DNI ${dni}? Se asignará el DNI como contraseña temporal.`;

  const handleAction = () => {
    startTransition(async () => {
      try {
        const result = await habilitarAccesoAction(idPersona, dni);
        if (result.success) {
          toast.success(result.message);
          setIsOpen(false);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Ocurrió un error inesperado al procesar el acceso.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className={`p-2 rounded-full transition-all shadow-sm border ${
          isActive
            ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
            : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
        }`}
        title={isActive ? "Restablecer contraseña al DNI" : "Habilitar acceso (Dar vida)"}
      >
        {isActive ? <KeyRound size={18} /> : <LockKeyholeOpen size={18} />}
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleAction}
        title={actionTitle}
        message={actionDescription}
        loading={isPending}
        variant={isActive ? "warning" : "info"}
      />
    </>
  );
}