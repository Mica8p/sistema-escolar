import { CicloForm } from "@/components/modules/ciclos/CicloForm";
import db from "@/lib/db";

export default async function NuevoCicloPage() {
  const ciclos = await db.cicloLectivo.findMany({
    orderBy: { anio: 'desc' },
    take: 2
  });

  const cicloAnterior = ciclos.length > 0 ? ciclos[0] : null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black mb-4">Agregar Nuevo Ciclo Lectivo</h1>
      <div className="max-w-2xl mx-auto">
        <CicloForm cicloAnteriorId={cicloAnterior?.idCiclo} anioAnterior={cicloAnterior?.anio} />
      </div>
    </div>
  );
}