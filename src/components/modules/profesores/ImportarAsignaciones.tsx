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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const router = useRouter();

  if (!cicloAnteriorId || isHidden) return null;

  // Si hay un error, mostrar notificación de error
  if (showError) {
    return (
      <div className="border border-rose-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-rose-50 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-rose-100">
            <AlertTriangle className="text-rose-600" size={24} />
          </div>
          <div>
            <h3 className="font-black uppercase text-xs tracking-widest text-rose-900">
              No se pudo importar
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              {showError}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowError(null)}
          className="p-3 text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0"
          title="Cerrar"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  const handleClonar = async () => {
    setLoading(true);
    const res = await clonarAsignacionesYHorarios(cicloAnteriorId, cicloActualId);
    setLoading(false);

    if ("success" in res && res.success) {
      setLastResult({ count: res.count, horariosCount: res.horariosCount });
      setConfirmMode(false);
      setShowSuccess(true);
      setShowError(null);
      
      // Desaparecer después de 2 segundos
      setTimeout(() => {
        setIsHidden(true);
      }, 2000);

      router.refresh();
    } else if ("error" in res) {
      setShowError(res.error);
      setConfirmMode(false);
    }
  };

  const handleClose = () => {
    setIsHidden(true);
  };

  const isAllSynced = lastResult?.count === 0;
  const bgColor = showSuccess 
    ? "bg-emerald-50 border-emerald-200" 
    : isAllSynced 
      ? "bg-emerald-50 border-emerald-200" 
      : (yaTieneDatos ? "bg-indigo-50 border-indigo-200" : "bg-amber-50 border-amber-200");
  const iconColor = showSuccess 
    ? "text-emerald-600" 
    : isAllSynced 
      ? "text-emerald-600" 
      : (yaTieneDatos ? "text-indigo-600" : "text-amber-600");

  return (
    <div className={`border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8 transition-all duration-500 ${bgColor}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${showSuccess ? 'bg-emerald-100' : (isAllSynced ? 'bg-emerald-100' : (yaTieneDatos ? 'bg-indigo-100' : 'bg-amber-100'))}`}>
          {showSuccess ? <CheckCircle2 className={iconColor} /> : isAllSynced ? <Sparkles className={iconColor} /> : <CalendarDays className={iconColor} />}
        </div>
        <div>
          <h3 className={`font-black uppercase text-xs tracking-widest ${showSuccess ? 'text-emerald-900' : (isAllSynced ? 'text-emerald-900' : (yaTieneDatos ? 'text-indigo-900' : 'text-amber-900'))}`}>
            {showSuccess
              ? "¡Importación completada!"
              : isAllSynced 
              ? "¡Horarios al día!" 
              : "Importación de Estructura"}
          </h3>
          <p className="text-slate-500 text-sm italic">
            {showSuccess
              ? `Se importaron ${lastResult?.count} profesores y ${lastResult?.horariosCount} horarios del ciclo ${anioAnterior}.`
              : isAllSynced
              ? "Los profesores y sus horarios coinciden con el ciclo anterior."
              : `Copiando profesores, materias y horarios del ciclo ${anioAnterior}.`}
          </p>
        </div>
      </div>

      {!confirmMode ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirmMode(true)}
            disabled={isAllSynced || showSuccess}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${
              isAllSynced || showSuccess
                ? "bg-emerald-100 text-emerald-600 cursor-default"
                : (yaTieneDatos ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white")
            }`}
          >
            {isAllSynced || showSuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {showSuccess ? "Completado" : isAllSynced ? "Sincronizado" : (yaTieneDatos ? "Sincronizar todo" : `Importar del ${anioAnterior}`)}
          </button>
          <button 
            onClick={handleClose}
            className="p-3 text-slate-400 hover:text-slate-600 transition-colors"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
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
          <button 
            onClick={() => setConfirmMode(false)} 
            className="p-3 text-slate-400 hover:text-rose-600 transition-colors"
            title="Cancelar"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}