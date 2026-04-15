import { CicloForm } from "@/components/modules/ciclos/CicloForm";
import { CicloService } from "@/service/ciclo.service";
import { notFound } from "next/navigation";

interface EditPageProps {
    params: Promise<{
        id: string;
    }>
}

export default async function EditCicloPage({ params }: EditPageProps) {
  const { id } = await params;
  const cicloId = Number(id);
  if (isNaN(cicloId)) {
    return notFound();
  }

  const ciclo = await CicloService.getById(cicloId);

  if (!ciclo) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black mb-4">Editar Ciclo Lectivo</h1>
      <div className="max-w-2xl mx-auto">
        <CicloForm ciclo={ciclo} />
      </div>
    </div>
  );
}