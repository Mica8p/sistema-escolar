"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen, onClose, onConfirm, title, message, loading
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* ENCABEZADO */}
        <div className="relative p-8 pb-0 flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
            <AlertTriangle size={40} />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">
            {title}
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* ACCIONES */}
        <div className="p-8 flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-100 transition-all disabled:opacity-50"
          >
            {loading ? "Eliminando..." : "Sí, Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}