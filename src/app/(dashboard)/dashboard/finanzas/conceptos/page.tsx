import { getConceptosDePago } from "@/service/finanzas.service";
import { ConceptoForm } from "@/components/modules/finanzas/ConceptoForm";
import { Receipt, ListOrdered } from "lucide-react";

export default async function ConceptosPage() {
  const conceptos = await getConceptosDePago();

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* 🔝 CABECERA */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
          Configuración de Conceptos
        </h1>
        <p className="text-slate-500 text-sm font-medium italic">
          Administrá los tipos de cargos y montos fijos del ciclo lectivo.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 📋 COLUMNA IZQUIERDA: LISTADO */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center gap-2 shrink-0">
            <ListOrdered size={18} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Listado de Conceptos Actuales</span>
          </div>

          <div className="p-6">
            {conceptos.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic text-sm">
                No hay conceptos registrados aún.
              </div>
            ) : (
              <div className="grid gap-4">
                {conceptos.map((concepto) => (
                  <div
                    key={concepto.id}
                    className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-white hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="space-y-1">
                      <p className="font-black text-xs text-slate-700 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                        {concepto.nombre}
                      </p>
                      {concepto.descripcion && (
                        <p className="text-[11px] font-medium text-slate-400 italic leading-none">
                          {concepto.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-sm shadow-lg shadow-slate-200">
                      ${concepto.montoFijo?.toLocaleString() || '0'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 📝 COLUMNA DERECHA: FORMULARIO */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
            <Receipt size={18} className="text-indigo-600" />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Nuevo Concepto de Pago</span>
          </div>
          <div className="p-8">
            <ConceptoForm />
          </div>
        </div>
      </div>
    </div>
  );
}