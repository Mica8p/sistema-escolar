"use client";

import { habilitarAccesoAction } from "@/lib/actions/persona-actions";
import { KeyRound, LockKeyholeOpen } from "lucide-react";
import { useTransition } from "react";

interface Props {
  idPersona: number;
  dni: string;
  isActive: boolean;
}

export default function EnableAccessButton({ idPersona, dni, isActive }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleEnable = () => {
    const actionText = isActive ? "Restablecer contraseña" : "Habilitar acceso";
    const confirmMessage = isActive
      ? `¿Deseas restablecer la contraseña del usuario con DNI ${dni}?\nLa nueva contraseña será el número de DNI.`
      : `¿Deseas habilitar el acceso para el usuario con DNI ${dni}?\nSe asignará el DNI como contraseña temporal.`;

    if (!confirm(confirmMessage)) return;

    startTransition(async () => {
      const result = await habilitarAccesoAction(idPersona, dni);
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.message}`);
      }
    });
  };

  return (
    <button
      onClick={handleEnable}
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
  );
}