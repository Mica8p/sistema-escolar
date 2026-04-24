"use client";

import { deleteMateria } from "@/lib/actions/materia-actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface DeleteMateriaButtonProps {
    id: number;
}

export function DeleteMateriaButton({ id }: DeleteMateriaButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        if (confirm("¿Estás seguro de que deseas eliminar esta materia?")) {
            startTransition(async () => {
                const result = await deleteMateria(id);
                if (result?.success === false) {
                    toast.error(result.message || "Error al eliminar");
                } else {
                    toast.success("Materia eliminada correctamente");
                }
            });
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110 disabled:opacity-50"
            title="Eliminar materia"
        >
            <Trash2 size={18} />
        </button>
    );
}
