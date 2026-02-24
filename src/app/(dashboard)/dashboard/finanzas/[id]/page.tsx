import { getDetalleCuenta, getConceptosDePago } from "@/service/finanzas.service";
import EstadoCuentaSummary from "@/components/modules/finanzas/EstadoCuentaSummary";
import CargosList from "@/components/modules/finanzas/CargosList";
import PagosList from "@/components/modules/finanzas/PagosList";
import { RegistrarPagoWrapper } from "@/components/modules/finanzas/RegistrarPagoWrapper";
import { CrearDeudaDialog } from "@/components/modules/finanzas/crear-deuda-dialog";
import { DollarSign, ReceiptText } from "lucide-react";

export default async function DetalleFinancieroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alumno = await getDetalleCuenta(Number(id));
  const conceptos = await getConceptosDePago();

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Estado de Cuenta
          </h1>
          <p className="text-slate-500 text-sm font-medium italic">Gestión de movimientos y saldos del alumno</p>
        </div>
        <div className="flex items-center gap-3">
          <RegistrarPagoWrapper alumno={alumno} />
          <CrearDeudaDialog alumnoId={alumno.idAlumno} conceptos={conceptos} />
        </div>
      </div>

      <EstadoCuentaSummary alumno={alumno} />

      <div className="flex flex-col gap-8">

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Listado de Cargos y Deudas</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <CargosList cargos={alumno.cargos} />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2">
            <ReceiptText size={18} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Historial de Pagos Realizados</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <PagosList
              pagos={alumno.pagos}
              alumnoData={{
                nombre: `${alumno.persona.nombre} ${alumno.persona.apellido}`,
                legajo: (alumno as any).legajo || `LEG-${alumno.idAlumno}`,
                curso: (alumno as any).matriculas?.[0]?.curso
                  ? `${(alumno as any).matriculas[0].curso.grado}° "${(alumno as any).matriculas[0].curso.seccion}"`
                  : "Sin Curso"
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}