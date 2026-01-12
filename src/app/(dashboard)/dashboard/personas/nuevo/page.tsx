import { PersonaService } from "@/service/persona.service";
import PersonaForm from "@/components/modules/personas/PersonaForm";

export default async function NuevaPersonaPage() {
  const roles = await PersonaService.getRoles();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Registrar Nueva Persona</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <PersonaForm roles={roles} />
      </div>
    </div>
  );
}