import { PersonaService } from "@/service/persona.service";
import PersonaForm from "@/components/modules/personas/PersonaForm";
import db from "@/lib/db";

export default async function NuevaPersonaPage() {
  const roles = await PersonaService.getRoles();
  const alumnos = await db.alumno.findMany({
    include: { persona: true, matriculas: true },
    orderBy: { persona: { apellido: 'asc' } }
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Registrar Nueva Persona</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <PersonaForm roles={roles} alumnos={alumnos} />
      </div>
    </div>
  );
}