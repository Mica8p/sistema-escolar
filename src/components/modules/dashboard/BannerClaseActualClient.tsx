"use client";

import { useState, useEffect } from "react";
import { Zap, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export default function BannerClaseActualClient({ clasesHoy }: { clasesHoy: any[] }) {
  const [claseActual, setClaseActual] = useState<any>(null);

  useEffect(() => {
    const chequearClase = () => {
      const ahora = new Date();
      const horaActualStr = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

      const encontrada = clasesHoy.find(h =>
        horaActualStr >= h.horaInicio && horaActualStr <= h.horaFin
      );
      setClaseActual(encontrada);
    };

    chequearClase();
    const intervalo = setInterval(chequearClase, 30000); // Chequea cada 30 segundos
    return () => clearInterval(intervalo);
  }, [clasesHoy]);

  if (!claseActual) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-[2px] rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 mb-8 animate-in slide-in-from-top duration-500">
      <div className="bg-white/95 backdrop-blur-sm p-6 rounded-[2.4rem] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Zap size={28} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <div>
            <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">Clase en curso</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">
              {claseActual.asignacion.materia.nombre} <span className="text-indigo-600">{claseActual.asignacion.curso.grado}° "{claseActual.asignacion.curso.seccion}"</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Finaliza {claseActual.horaFin} hs</p>
          </div>
        </div>

        <Link
          href={`/dashboard/asistencias?mat=${claseActual.asignacion.idMateria}&horario=${claseActual.idHorario}`}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3"
        >
          <ClipboardCheck size={18} /> Tomar Asistencia
        </Link>
      </div>
    </div>
  );
}