import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PersonaService } from "@/service/persona.service";
import PersonasClient from "@/components/modules/personas/PersonasClient";
import { getCicloActual } from "@/lib/ciclo-session";

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  const idCiclo = await getCicloActual();
  const [personas] = await Promise.all([
    PersonaService.getAll(undefined, idCiclo)
  ]);
  const { success } = await searchParams;

  return (
    <PersonasClient 
      personas={personas} 
      success={success}
      currentUserRoles={session.user.roles || []}
      currentUserEmail={session.user.email || undefined}
    />
  );
}