"use client";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen, onClose, onConfirm, title, message, loading, variant = "danger"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: "bg-red-500 hover:bg-red-600 shadow-red-100 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-100 text-white",
    info: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 text-white",
  };

  const iconColors = {
    danger: "bg-red-50 text-red-500",
    warning: "bg-amber-50 text-amber-500",
    info: "bg-indigo-50 text-indigo-500",
  };

  return (
    <div className="fixed inset-0 z-[100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="relative p-8 pb-0 flex flex-col items-center text-center">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full">
            <X size={20} />
          </button>

          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${iconColors[variant]}`}>
            <AlertTriangle size={40} />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">{title}</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
        </div>

        <div className="p-8 flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 ${colors[variant]}`}
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}