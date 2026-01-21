import { getDetalleCuenta, getConceptosDePago } from "@/service/finanzas.service";
import EstadoCuentaSummary from "@/components/modules/finanzas/EstadoCuentaSummary";
import CargosList from "@/components/modules/finanzas/CargosList";
import PagosList from "@/components/modules/finanzas/PagosList";
import { RegistrarPagoWrapper } from "@/components/modules/finanzas/RegistrarPagoWrapper";
import { CrearDeudaDialog } from "@/components/modules/finanzas/crear-deuda-dialog";

export default async function DetalleFinancieroPage({ params }: { params: Promise<{ id: string }> }) {
  // CORRECCIÓN: Esperamos a que params se resuelva antes de usar el ID
  const { id } = await params;
  const alumno = await getDetalleCuenta(Number(id));
  const conceptos = await getConceptosDePago();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Estado de Cuenta</h1>
        <div className="flex items-center">
          <RegistrarPagoWrapper alumno={alumno} />
          <CrearDeudaDialog alumnoId={alumno.idAlumno} conceptos={conceptos} />
        </div>
      </div>

      <EstadoCuentaSummary alumno={alumno} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">Cargos</h2>
                    <CargosList cargos={alumno.cargos} />
                </div>
            </div>
        </div>
        <div className="space-y-6">
             <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">Pagos Realizados</h2>
                    <PagosList pagos={alumno.pagos} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}