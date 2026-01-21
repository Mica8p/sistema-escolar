import { getAlumnosConEstadoDeCuenta, getConceptosDePago } from "@/service/finanzas.service";
import AlumnosDeudoresList from "@/components/modules/finanzas/AlumnosDeudoresList";
import { GenerarCuotaMasivaDialog } from "@/components/modules/finanzas/generar-cuota-masiva-dialog";
import Link from "next/link";

export default async function FinanzasPage() {
  const [alumnos, conceptos] = await Promise.all([
    getAlumnosConEstadoDeCuenta(),
    getConceptosDePago(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Finanzas y Cuotas</h1>
        <div className="flex gap-3">
          <GenerarCuotaMasivaDialog conceptos={conceptos} />
          <Link 
            href="/dashboard/finanzas/conceptos" 
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 font-medium shadow-sm flex items-center"
          >
            Gestionar Conceptos
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Listado de Alumnos</h2>
        <AlumnosDeudoresList alumnos={alumnos} />
      </div>
    </div>
  );
}