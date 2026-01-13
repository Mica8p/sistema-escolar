import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const session = await auth();

  // Si no hay sesión, al login
  if (!session) {
    redirect("/login");
  }

  // Si ya está logueado, al dashboard
  redirect("/dashboard");
}
