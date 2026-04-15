import { PersonaService } from "@/service/persona.service";
import PersonasClient from "@/components/modules/personas/PersonasClient";
import { getCicloActual } from "@/lib/ciclo-session";

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const idCiclo = await getCicloActual();
  const [personas] = await Promise.all([
    PersonaService.getAll(undefined, idCiclo)
  ]);
  const { success } = await searchParams;

  return <PersonasClient personas={personas} success={success} />;
}