import { PersonaService } from "@/service/persona.service";
import PersonasClient from "@/components/modules/personas/PersonasClient";

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const personas = await PersonaService.getAll();
  const { success } = await searchParams;

  return <PersonasClient personas={personas} success={success} />;
}