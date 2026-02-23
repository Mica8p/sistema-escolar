'use client';

import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, RotateCcw } from "lucide-react";

interface Props {
  fechaISO: string;
  hoyISO: string;
  idAsignacion: number;
  nombreDia: string;
}

export default function AsistenciasHeader({ fechaISO, hoyISO, idAsignacion, nombreDia }: Props) {
  const router = useRouter();

  const handleDateChange = (nuevaFecha: string) => {
    router.push(`?asig=${idAsignacion}&fecha=${nuevaFecha}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Control de Asistencias</h1>
        <p className="text-slate-500 text-sm font-medium">
          Mostrando clases para el día <span className="text-indigo-600 font-bold">{nombreDia}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* BOTÓN "HOY" */}
        {fechaISO !== hoyISO && (
          <button
            onClick={() => handleDateChange(hoyISO)}
            className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <RotateCcw size={14} />
            Volver a Hoy
          </button>
        )}

        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <CalendarIcon size={20} className="text-indigo-600" />
          <input
            type="date"
            value={fechaISO}
            className="text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}