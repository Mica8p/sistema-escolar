"use client";

import { deletePersona } from "@/lib/actions/persona-actions";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "@/components/shared/ConfirmModal";


export default function DeletePersonaButton({ idPersona }: { idPersona: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async () => {
        const result = await deletePersona(idPersona);
        setIsModalOpen(false);
        if (!result.success) {
            alert(result.message);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors flex items-center gap-1"
            >
                <Trash2 size={14} />
                Eliminar
            </button>
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                description="¿Estás seguro de que deseas eliminar a esta persona? Esta acción es irreversible y eliminará todos los datos asociados (usuarios, matrículas, notas, etc.)."
            />
        </>
    );
}