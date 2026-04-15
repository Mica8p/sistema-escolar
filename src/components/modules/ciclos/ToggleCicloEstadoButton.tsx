"use client";

import { toggleCicloEstado } from "@/lib/actions/ciclo-actions";
import { useTransition, useState } from "react";
import ConfirmModal from "@/components/shared/ConfirmModal";

interface ToggleCicloEstadoButtonProps {
    id: number;
    estado: boolean;
    isAnyActive: boolean;
}

export function ToggleCicloEstadoButton({ id, estado, isAnyActive }: ToggleCicloEstadoButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = () => {
        setIsModalOpen(true);
    };

    const handleConfirm = () => {
        startTransition(async () => {
            const result = await toggleCicloEstado(id, estado);
            if (result?.success === false) {
                alert(result.message);
            } else {
                setIsModalOpen(false);
            }
        });
    };

    const buttonClass = estado
        ? "w-6 h-6 text-green-500 hover:text-green-700 hover:scale-110"
        : "w-6 h-6 text-red-500 hover:text-red-700 hover:scale-110";
    
    const title = estado ? "Desactivar ciclo" : "Activar ciclo";
    
    const modalTitle = estado ? "Desactivar ciclo" : "Activar ciclo";
    const modalMessage = !estado && isAnyActive 
        ? "Ya hay un ciclo lectivo activo. ¿Deseas desactivar el actual y activar este?"
        : `¿Estás seguro de que deseas ${estado ? "desactivar" : "activar"} este ciclo lectivo?`;
    const modalVariant = estado ? "warning" : "info";

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isPending}
                className={`w-4 mr-2 transform transition-transform duration-200 ${buttonClass}`}
                title={title}
            >
                {estado ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            </button>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                title={modalTitle}
                message={modalMessage}
                loading={isPending}
                variant={modalVariant}
            />
        </>
    );
}