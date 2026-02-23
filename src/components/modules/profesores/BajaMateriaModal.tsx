"use client";
import { useState } from "react";
import { AlertTriangle, X, Loader2, MessageSquare } from "lucide-react";

interface BajaMateriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  title: string;
  materia: string;
  loading?: boolean;
}

export default function BajaMateriaModal({
  isOpen, onClose, onConfirm, title, materia, loading
}: BajaMateriaModalProps) {
  const [motivo, setMotivo] = useState("Fin de suplencia / Licencia");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="relative p-8 pb-0 flex flex-col items-center text-center">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full">
            <X size={20} />
          </button>

          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-amber-50 text-amber-500">
            <AlertTriangle size={40} />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">{title}</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-6">
            ¿Confirmás la baja de la materia <span className="text-slate-800 font-bold">{materia}</span>?
          </p>

          <div className="w-full text-left space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Motivo de la baja</label>
            <div className="relative">
              <MessageSquare className="absolute top-4 left-4 text-slate-300" size={18} />
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-600 font-medium focus:border-amber-400 focus:bg-white transition-all outline-none resize-none h-24"
                placeholder="Escribí el motivo aquí..."
              />
            </div>
          </div>
        </div>

        <div className="p-8 flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(motivo)}
            disabled={loading || !motivo.trim()}
            className="flex-1 px-6 py-4 rounded-2xl bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-100 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Confirmar Baja"}
          </button>
        </div>
      </div>
    </div>
  );
}