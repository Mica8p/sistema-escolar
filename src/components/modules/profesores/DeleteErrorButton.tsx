"use client";

import { Trash2 } from "lucide-react";
import { borrarErrorAsignacionAction } from "@/lib/actions/profesor-actions";

export default function DeleteErrorButton({ id }: { id: number }) {
  const handleDelete = async () => {
    const ok = confirm("¿Estás seguro de borrar este registro permanentemente? Solo hacelo si fue un error de carga. Si el docente dio clases, es mejor dejarlo en el historial.");

    if (ok) {
      const res = await borrarErrorAsignacionAction(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
      title="Eliminar error de carga permanentemente"
    >
      <Trash2 size={16} />
    </button>
  );
}