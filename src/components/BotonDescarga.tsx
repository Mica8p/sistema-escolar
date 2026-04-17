"use client";

import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface Props {
  contentRef: React.RefObject<HTMLDivElement | null>;
  label?: string;
  variant?: "emerald" | "indigo" | "slate";
}

export default function BotonImprimir({ contentRef, label = "Imprimir", variant = "emerald" }: Props) {
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Reporte_EscuelaPro_${new Date().getTime()}`,
  });

  const colors = {
    emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100",
    indigo: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100",
    slate: "bg-slate-800 hover:bg-slate-900 shadow-slate-200",
  };

  return (
    <button
      onClick={() => handlePrint()}
      className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${colors[variant]}`}
    >
      <Printer size={14} /> {label}
    </button>
  );
}