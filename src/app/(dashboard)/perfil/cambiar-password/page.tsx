import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CambiarPasswordForm from "@/components/modules/perfil/CambiarPasswordForm";

export default async function CambiarPasswordPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <CambiarPasswordForm />;
}
