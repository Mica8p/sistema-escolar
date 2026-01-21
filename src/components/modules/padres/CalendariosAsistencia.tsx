"use client";

import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function CalendarioAsistencia({ asistencias }: { asistencias: any[] }) {
  const porFecha = asistencias.reduce((acc: any, curr) => {
    const fechaLabel = new Date(curr.fecha).toLocaleDateString('es-AR', {
      weekday: 'long', day: '2-digit', month: 'long'
    });
    if (!acc[fechaLabel]) acc[fechaLabel] = [];
    acc[fechaLabel].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.keys(porFecha).map((fecha) => (
        <div key={fecha} className="bg-white rounded-[2rem border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <Calendar size={18} className="text-indigo-600" />
            <h4 className="text-sm font-black text-slate-700 capitalize">{fecha}</h4>
          </div>

          <div className="divide-y divide-slate-100">
            {porFecha[fecha].map((reg: any) => (
              <div key={reg.idAsistencia} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${
                    reg.estado === 'Presente' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {reg.estado === 'Presente' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  </div>
                  <div>
                    {/* ✅ RUTA CORREGIDA: horario -> asignacion -> materia */}
                    <p className="font-bold text-slate-800 text-sm uppercase">
                      {reg.horario.asignacion.materia.nombre}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                      <Clock size={12} />
                      {/* ✅ LAS HORAS ESTÁN EN EL MODELO HORARIO */}
                      {reg.horario.horaInicio} hs. - {reg.horario.horaFin} hs.
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                  reg.estado === 'Presente' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {reg.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}