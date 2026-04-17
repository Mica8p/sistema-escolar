"use client";

import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  hijoData: {
    idAlumno: number;
    nombreCompleto: string;
    stats: {
      presentismo: number;
      ausencias: number;
      llegadasTarde: number;
      faltasJustificadas: number
    };
  };
  showHeader?: boolean;
}

export default function CardAsistenciaHijo({ hijoData }: Props) {
  const { stats, idAlumno } = hijoData;

  const total = (stats?.presentismo || 0) + (stats?.ausencias || 0) +
                (stats?.llegadasTarde || 0) + (stats?.faltasJustificadas || 0);

  const porcentaje = total > 0
    ? Math.round(((stats.presentismo + stats.llegadasTarde) / total) * 100)
    : 0;

  return (
    <div className="bg-white rounded-[2rem border border-slate-200 p-8 shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={14} className="text-indigo-500" /> Resumen de Asistencia
        </h3>

        <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-3xl">
          <div className="relative w-20 h-20 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="35" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                <circle cx="40" cy="40" r="35" stroke="#4f46e5" strokeWidth="8" fill="transparent"
                  strokeDasharray={220} strokeDashoffset={220 - (porcentaje / 100) * 220} strokeLinecap="round" />
             </svg>
             <span className="absolute text-sm font-black text-slate-700">{porcentaje}%</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">Presentismo</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Estatus Ciclo 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <span className="block text-2xl font-black text-emerald-600">{stats?.presentismo || 0}</span>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Presentes</span>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
            <span className="block text-2xl font-black text-rose-600">{stats?.ausencias || 0}</span>
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Ausentes</span>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
            <span className="block text-2xl font-black text-amber-600">{stats?.llegadasTarde || 0}</span>
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter flex items-center justify-center gap-1">
               Tardes
            </span>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
            <span className="block text-2xl font-black text-indigo-600">{stats?.faltasJustificadas || 0}</span>
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">Justificadas</span>
          </div>
        </div>
      </div>

      <Link
        href={`/dashboard/asistencias/${idAlumno}`}
        className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
      >
        Ver historial detallado <ArrowRight size={14} />
      </Link>
    </div>
  );
}