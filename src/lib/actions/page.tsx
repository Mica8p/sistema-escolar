import { CicloService } from "@/service/ciclo.service";
import { getCicloActual } from "@/lib/ciclo-session";
import PeriodosManager from "@/components/ciclos/periodos-manager";
import { Calendar } from "lucide-react";

export default async function PeriodosPage() {
  const idCiclo = await getCicloActual();
  const ciclo = await CicloService.getById(idCiclo);
  
  if (!ciclo) {
    return (
        <div className="p-8 text-center text-gray-500">
            No se encontró un ciclo lectivo activo o seleccionado.
        </div>
    );
  }

  const periodos = await CicloService.getPeriodos(idCiclo);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="p-3 bg-blue-50 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Periodos Académicos</h1>
            <p className="text-sm text-gray-500">
                Gestión de trimestres y fechas de examen para el <strong>Ciclo {ciclo.anio}</strong>
            </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-800">Configuración de Fechas</h2>
            <p className="text-xs text-gray-500">
                Definí las fechas de inicio y fin para cada trimestre o instancia de recuperación.
            </p>
        </div>
        
        <PeriodosManager idCiclo={ciclo.idCiclo} periodos={periodos} />
      </div>
    </div>
  );
}