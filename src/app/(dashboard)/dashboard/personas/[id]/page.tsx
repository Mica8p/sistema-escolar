import { PersonaService } from "@/service/persona.service";
import PersonaForm from "@/components/modules/personas/PersonaForm";
import { notFound } from "next/navigation";

export default async function EditarPersonaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [persona, roles] = await Promise.all([
    PersonaService.getById(Number(id)),
    PersonaService.getRoles()
  ]);

  if (!persona) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Editar Persona</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        {/* Reutilizamos el mismo formulario, pero le pasamos los datos iniciales */}
        <PersonaForm roles={roles} initialData={persona} />
      </div>
    </div>
  );
}