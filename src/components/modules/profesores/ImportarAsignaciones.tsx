"use client";

import { useState } from "react";
import { Copy, Loader2, CheckCircle2, AlertTriangle, X, Sparkles, CalendarDays } from "lucide-react";
import { clonarAsignacionesYHorarios } from "@/lib/actions/asignacion-actions";
import { useRouter } from "next/navigation";

interface Props {
  cicloActualId: number;
  cicloAnteriorId: number | null;
  anioAnterior: number | null;
  yaTieneDatos: boolean;
}

export function ImportarAsignaciones({ cicloActualId, cicloAnteriorId, anioAnterior, yaTieneDatos }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmMode, setConfirmMode] = useState(false);
  const [lastResult, setLastResult] = useState<{count: number; horariosCount?: number} | null>(null);
  const router = useRouter();

  if (!cicloAnteriorId) return null;

  const handleClonar = async () => {
    setLoading(true);
    const res = await clonarAsignacionesYHorarios(cicloAnteriorId, cicloActualId);
    setLoading(false);
    setConfirmMode(false);

    if ("success" in res && res.success) {
      setLastResult({ count: res.count, horariosCount: res.horariosCount });

      alert(`¡Éxito total! Se importaron ${res.count} profesores y ${res.horariosCount} horarios completos.`);

      router.refresh();
      setTimeout(() => setLastResult(null), 5000);
    } else if ("error" in res) {
      alert(res.error);
    }
  };

  const isAllSynced = lastResult?.count === 0;
  const bgColor = isAllSynced ? "bg-emerald-50 border-emerald-200" : (yaTieneDatos ? "bg-indigo-50 border-indigo-200" : "bg-amber-50 border-amber-200");
  const iconColor = isAllSynced ? "text-emerald-600" : (yaTieneDatos ? "text-indigo-600" : "text-amber-600");

  return (
    <div className={`border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8 transition-all duration-500 ${bgColor}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${isAllSynced ? 'bg-emerald-100' : (yaTieneDatos ? 'bg-indigo-100' : 'bg-amber-100')}`}>
          {isAllSynced ? <Sparkles className={iconColor} /> : <CalendarDays className={iconColor} />}
        </div>
        <div>
          <h3 className={`font-black uppercase text-xs tracking-widest ${isAllSynced ? 'text-emerald-900' : (yaTieneDatos ? 'text-indigo-900' : 'text-amber-900')}`}>
            {isAllSynced ? "¡Horarios al día!" : "Importación de Estructura"}
          </h3>
          <p className="text-slate-500 text-sm italic">
            {isAllSynced
              ? "Los profesores y sus horarios coinciden con el ciclo anterior."
              : `Copiando profesores, materias y horarios del ciclo ${anioAnterior}.`}
          </p>
        </div>
      </div>

      {!confirmMode ? (
        <button
          onClick={() => setConfirmMode(true)}
          disabled={isAllSynced}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${
            isAllSynced
              ? "bg-emerald-100 text-emerald-600 cursor-default"
              : (yaTieneDatos ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white")
          }`}
        >
          {isAllSynced ? <CheckCircle2 size={16} /> : <Copy size={16} />}
          {isAllSynced ? "Sincronizado" : (yaTieneDatos ? "Sincronizar todo" : `Importar del ${anioAnterior}`)}
        </button>
      ) : (
        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
          <button
            onClick={handleClonar}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 size={16} />}
            Confirmar e Importar
          </button>
          <button onClick={() => setConfirmMode(false)} className="p-3 text-slate-400 hover:text-rose-600">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}