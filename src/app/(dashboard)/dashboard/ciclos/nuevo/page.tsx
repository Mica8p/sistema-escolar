import { CicloForm } from "@/components/modules/ciclos/CicloForm";

export default function NuevoCicloPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black mb-4">Agregar Nuevo Ciclo Lectivo</h1>
      <div className="max-w-2xl mx-auto">
        <CicloForm />
      </div>
    </div>
  );
}