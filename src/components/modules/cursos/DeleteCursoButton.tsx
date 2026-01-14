"use client";

import { deleteCurso } from "@/lib/actions/curso-actions";
import { useTransition } from "react";

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
                    alert(result.message);
                }
            });
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    );
}
