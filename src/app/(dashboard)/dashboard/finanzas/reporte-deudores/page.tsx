import { getAlumnosConEstadoDeCuenta } from "@/service/finanzas.service";
import ReporteDeudoresTable from "@/components/modules/finanzas/ReporteDeudoresTable";

export default async function ReporteDeudoresPage() {
  const todosLosAlumnos = await getAlumnosConEstadoDeCuenta();

  const deudores = todosLosAlumnos
    .filter(a => a.deudaTotal > 0)
    .map(a => ({
      ...a,
      deudaFormateada: new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }).format(a.deudaTotal)
    }));


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Reporte de Morosidad
          </h1>
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
            Ciclo Lectivo 2026 - Corte al {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <ReporteDeudoresTable deudores={deudores} />
    </div>
  );
}