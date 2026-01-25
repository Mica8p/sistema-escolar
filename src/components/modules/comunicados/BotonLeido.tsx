// src/components/modules/comunicados/BotonLeido.tsx
"use client";

import { marcarComoLeido } from "@/lib/actions/comunicado-actions";
import { CheckCheck } from "lucide-react";
import { useTransition } from "react";

export default function BotonLeido({ idComunicado }: { idComunicado: number }) {
  const [isPending, startTransition] = useTransition();

  const handleMarcarLeido = () => {
    startTransition(async () => {
      await marcarComoLeido(idComunicado);
    });
  };

  return (
    <button
      onClick={handleMarcarLeido}
      disabled={isPending}
      className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
    >
      <CheckCheck size={14} />
      {isPending ? "Actualizando..." : "Marcar como leído"}
    </button>
  );
}