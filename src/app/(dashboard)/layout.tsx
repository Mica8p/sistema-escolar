// src/app/(dashboard)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import FirstLoginModal from "./FirstLoginModal";
import { getContadorNoLeidos } from "@/service/comunicado.service"; // ✅ Importamos el servicio

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth().catch(() => null);

  if (!session) redirect("/login");

  const roles = (session.user as any).roles || [];
  const idUsuario = (session.user as any).idUsuario;
  const shouldForceChange = (session.user as any).isDefaultPassword;


  const noLeidos = idUsuario ? await getContadorNoLeidos(idUsuario, roles[0]) : 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 🚀 Pasamos el contador al Sidebar */}
      <Sidebar userRoles={roles} noLeidos={noLeidos} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header userName={session.user?.name} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
      <FirstLoginModal shouldForceChange={shouldForceChange} />
    </div>
  );
}