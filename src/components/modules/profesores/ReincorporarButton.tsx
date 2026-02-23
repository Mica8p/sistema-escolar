"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { reincorporarDocenteAction } from "@/lib/actions/profesor-actions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { toast } from "sonner";

export default function ReincorporarButton({ id, profeNombre }: { id: number, profeNombre: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const res = await reincorporarDocenteAction(id);
    setLoading(false);
    setIsOpen(false);

    if (res.success) {
      toast.success(`¡Docente ${profeNombre} reincorporado con éxito!`);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-2 rounded-full transition-all"
        title="Reincorporar docente al cargo"
      >
        <RotateCcw size={16} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        title="Reincorporar Docente"
        message={`¿Confirmar reincorporación de ${profeNombre} a sus funciones activas?`}
        variant="info"
      />
    </>
  );
}