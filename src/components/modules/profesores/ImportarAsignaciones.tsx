"use client";
import { useState } from "react";
import { Copy, Loader2, AlertTriangle } from "lucide-react";
import { clonarAsignaciones } from "@/lib/actions/asignacion-actions";
import { useRouter } from "next/navigation";

interface Props {
  cicloActualId: number;
  cicloAnteriorId: number | null;
  anioAnterior: number | null;
}

export function ImportarAsignaciones({ cicloActualId, cicloAnteriorId, anioAnterior }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!cicloAnteriorId) return null;

const handleClonar = async () => {
  if (!confirm(`¿Estás seguro de copiar todas las materias y profes del ciclo ${anioAnterior}?`)) return;

  setLoading(true);
  const res = await clonarAsignaciones(cicloAnteriorId, cicloActualId);
  setLoading(false);

  // Usamos "success" in res para que TypeScript sepa qué objeto es
  if ("success" in res && res.success) {
    alert("¡Datos importados con éxito!");
    router.refresh();
  } else if ("error" in res) {
    alert(res.error);
  }
};

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-100 rounded-full">
          <AlertTriangle className="text-amber-600 w-6 h-6" />
        </div>
        <div>
          <h3 className="text-amber-900 font-bold">Ciclo sin asignaciones</h3>
          <p className="text-amber-700 text-sm">Este año académico aún no tiene docentes vinculados a materias.</p>
        </div>
      </div>
      <button
        onClick={handleClonar}
        disabled={loading}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Copy className="w-4 h-4" />}
        Importar del {anioAnterior}
      </button>
    </div>
  );
}