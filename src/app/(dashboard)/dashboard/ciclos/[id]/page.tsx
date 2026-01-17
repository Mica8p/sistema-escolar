import { CicloForm } from "@/components/modules/ciclos/CicloForm";
import { CicloService } from "@/service/ciclo.service";
import { notFound } from "next/navigation";

interface EditPageProps {
    params: {
        id: string;
    }
}

export default async function EditCicloPage({ params }: EditPageProps) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  const ciclo = await CicloService.getById(id);

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