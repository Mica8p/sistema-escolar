import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";

// 1. Forzamos que la página siempre sea dinámica (no caché)
export const dynamic = "force-dynamic";
// 2. Forzamos el entorno Node.js
export const runtime = "nodejs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Intentamos obtener la sesión de forma segura
  const session = await auth().catch(() => null);

  if (!session) {
    redirect("/login");
  }

  const roles = (session.user as any).roles || [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRoles={roles} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
          <div className="ml-auto text-sm text-slate-600">
            Conectado como: <strong>{session.user?.name}</strong>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}