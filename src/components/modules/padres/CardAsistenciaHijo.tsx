import { CalendarCheck, CalendarX, User } from "lucide-react";

// Definimos qué datos espera recibir este componente
interface Props {
  hijoData: {
    nombreCompleto: string;
    curso: string;
    stats: { presentismo: number; ausentismo: number };
    asistencias: Array<{
      id: number;
      fecha: string;
      estado: string;
      materia: string;
      horaInicio: string;
    }>;
  };
}

export default function CardAsistenciaHijo({ hijoData }: Props) {
  // Función auxiliar para dar color según el estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "PRESENTE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "TARDE": return "bg-amber-100 text-amber-700 border-amber-200";
      case "AUSENTE": return "bg-rose-100 text-rose-700 border-rose-200";
      case "JUSTIFICADA": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
      {/* HEADER DEL HIJO */}
      <div className="px-6 py-5 bg-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700 rounded-full border border-slate-600">
            <User className="text-indigo-300" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase">{hijoData.nombreCompleto}</h2>
            <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest">{hijoData.curso} • Ciclo 2026</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* RESUMEN ESTADÍSTICO */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CalendarCheck className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-700">{hijoData.stats.presentismo}</p>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Presentes / Tardes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100">
            <div className="p-3 bg-rose-100 rounded-xl">
              <CalendarX className="text-rose-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-rose-700">{hijoData.stats.ausentismo}</p>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Ausencias Totales</p>
            </div>
          </div>
        </div>

        {/* TABLA DETALLADA */}
        <div>
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 px-2">Historial Reciente</h3>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Materia / Horario</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {hijoData.asistencias.length === 0 ? (
                   <tr>
                     <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">
                       No hay registros de asistencia aún.
                     </td>
                   </tr>
                ) : (
                  hijoData.asistencias.map((asis) => (
                    <tr key={asis.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-700">{asis.fecha}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-700 uppercase text-xs">{asis.materia}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{asis.horaInicio} hs.</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(asis.estado)}`}>
                          {asis.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}