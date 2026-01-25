import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PerfilView from "@/components/modules/perfil/PerfilView";
import { getPerfilByIdPersona } from "@/service/perfil.service";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const perfil = await getPerfilByIdPersona(session.user.idPersona);
  if (!perfil) redirect("/dashboard");

  return <PerfilView perfil={perfil} />;
}
