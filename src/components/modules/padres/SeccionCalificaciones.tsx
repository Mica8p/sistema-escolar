import { Award, ChevronDown, Calendar } from "lucide-react";

export default function SeccionCalificaciones({ notas }: { notas: any[] }) {
  const materiasAgrupadas = notas.reduce((acc: any, curr) => {
    const nombre = curr.asignacion.materia.nombre;
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Award size={14} className="text-indigo-500" /> Rendimiento Académico
      </h3>

      <div className="space-y-4">
        {Object.keys(materiasAgrupadas).map((materia) => {
          const notasMateria = materiasAgrupadas[materia];
          const promedio = (notasMateria.reduce((s: any, n: any) => s + n.nota, 0) / notasMateria.length).toFixed(1);

          return (
            <details key={materia} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all shadow-sm">
              <summary className="flex justify-between items-center p-5 cursor-pointer list-none hover:bg-slate-50/50">
                <span className="font-bold text-slate-800 text-sm uppercase">{materia}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Promedio Actual</p>
                    <p className={`text-lg font-black ${Number(promedio) >= 6 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {promedio}
                    </p>
                  </div>
                  <ChevronDown size={18} className="text-slate-300 group-open:rotate-180 transition-transform" />
                </div>
              </summary>

              <div className="p-5 pt-0 bg-slate-50/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notasMateria.map((n: any) => (
                  <div key={n.idNota} className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{n.periodo.nombre}</span>
                    </div>
                    <span className="text-lg font-black text-slate-800">{n.nota}</span>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}