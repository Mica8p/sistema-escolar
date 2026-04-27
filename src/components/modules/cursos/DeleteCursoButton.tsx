"use client";

import { deleteCurso } from "@/lib/actions/curso-actions";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/shared/ConfirmModal";

interface DeleteCursoButtonProps {
    id: number;
}

export function DeleteCursoButton({ id }: DeleteCursoButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        const result = await deleteCurso(id);
        setLoading(false);
        setIsOpen(false);

        if (result?.success === false) {
            toast.error(result.message || "Error al eliminar");
        } else {
            toast.success("Curso eliminado correctamente");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110 disabled:opacity-50"
                title="Eliminar curso"
            >
                <Trash2 size={18} />
            </button>

            <ConfirmModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleConfirm}
                loading={loading}
                title="Eliminar Curso"
                message="¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer."
                variant="danger"
            />
        </>
    );
}
