"use client";

import { deleteCurso } from "@/lib/actions/curso-actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface DeleteCursoButtonProps {
    id: number;
}

export function DeleteCursoButton({ id }: DeleteCursoButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
            startTransition(async () => {
                const result = await deleteCurso(id);
                if (result?.success === false) {
                    toast.error(result.message || "Error al eliminar");
                } else {
                    toast.success("Curso eliminado correctamente");
                }
            });
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110 disabled:opacity-50"
            title="Eliminar curso"
        >
            <Trash2 size={18} />
        </button>
    );
}
