import { useState } from "react";
import { Award, ChevronDown, Calendar, FileText } from "lucide-react";

interface Nota {
  idNota: number;
  nota: number;
  tipo: string;
  observacion?: string | null;
  asignacion: {
    materia: { nombre: string };
  };
  periodo: { nombre: string };
}

export default function SeccionCalificaciones({ notas }: { notas: Nota[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Mostrar 5 materias por página

  // Agrupar por materia
  const materiasAgrupadas = notas.reduce((acc: Record<string, Nota[]>, curr) => {
    const nombre = curr.asignacion.materia.nombre;
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(curr);
    return acc;
  }, {});

  const materiaNames = Object.keys(materiasAgrupadas);
  const totalPages = Math.ceil(materiaNames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMaterias = materiaNames.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Award size={14} className="text-indigo-500" /> Rendimiento Académico
      </h3>

      <div className="space-y-4">
        {paginatedMaterias.map((materia) => {
          const notasMateria = materiasAgrupadas[materia];
          const promedio = (notasMateria.reduce((s: number, n: Nota) => s + n.nota, 0) / notasMateria.length).toFixed(1);

          // Agrupar por trimestre/período dentro de la materia
          const trimestresAgrupados = notasMateria.reduce((acc: Record<string, Nota[]>, curr) => {
            const periodoNombre = curr.periodo.nombre;
            if (!acc[periodoNombre]) acc[periodoNombre] = [];
            acc[periodoNombre].push(curr);
            return acc;
          }, {});

          // Ordenar con el orden personalizado: Trimestres, Diciembre, Febrero, Julio
          const ordenPersonalizado = [
            "TRIMESTRE_1",
            "TRIMESTRE_2",
            "TRIMESTRE_3",
            "DICIEMBRE",
            "FEBRERO",
            "JULIO_PREVIAS"
          ];
          const trimestresOrdenados = Object.keys(trimestresAgrupados).sort((a, b) => {
            const indexA = ordenPersonalizado.indexOf(a);
            const indexB = ordenPersonalizado.indexOf(b);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });

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

              <div className="p-5 pt-0 bg-slate-50/30 space-y-3">
                {trimestresOrdenados.map((trimestre) => {
                  const notasTrimestre = trimestresAgrupados[trimestre];

                  return (
                    <div key={trimestre} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      {/* HEADER DEL TRIMESTRE */}
                      <div className="mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-indigo-500" />
                          <span className="text-[11px] font-black text-slate-700 uppercase">{trimestre}</span>
                        </div>
                      </div>

                      {/* EVALUACIONES DEL TRIMESTRE */}
                      <div className="space-y-2">
                        {notasTrimestre.map((n: Nota) => (
                          <div key={n.idNota} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                                  n.tipo === 'Parcial' ? 'bg-blue-100 text-blue-700' :
                                  n.tipo === 'Recuperatorio' ? 'bg-orange-100 text-orange-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {n.tipo}
                                </span>
                              </div>
                              {n.observacion && (
                                <div className="mt-2 flex items-start gap-2">
                                  <FileText size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                  <p className="text-[10px] text-slate-600 leading-snug">{n.observacion}</p>
                                </div>
                              )}
                            </div>
                            <span className="text-lg font-black text-slate-800 ml-4">{n.nota}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}