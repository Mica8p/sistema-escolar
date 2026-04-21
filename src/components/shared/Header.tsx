import Link from "next/link";
import { logout } from "@/lib/actions/auth-actions";
import { getCicloActual } from "@/lib/ciclo-session";
import { CicloService } from "@/service/ciclo.service";
import { LogOut, User } from "lucide-react";
import { ConfiguracionesButton } from "../configuraciones-button";
import { auth } from "@/auth";
import { esSuperAdmin } from "@/lib/security";

interface HeaderProps {
  userName?: string | null;
}

export default async function Header({ userName }: HeaderProps) {
  const session = await auth();

  const roles = session?.user?.roles ?? [];
  const email = session?.user?.email;
  const isAdmin = roles.includes("ADMIN");
  const isSuperAdmin = esSuperAdmin(roles, email);

  const [ciclos, cicloActual] = await Promise.all([
    CicloService.getAll(),
    getCicloActual(),
  ]);

  const displayName = userName ?? session?.user?.name ?? "Mi cuenta";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm">
      <div className="text-sm text-slate-400 font-medium">
        SISTEMA DE GESTIÓN ESCOLAR <span className="text-blue-500">DIGITAL</span>
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/perfil"
          className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 hover:bg-slate-100 transition"
        >
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={14} className="text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {displayName}
          </span>
        </Link>

        <ConfiguracionesButton
          ciclos={ciclos}
          cicloActual={cicloActual}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
        />

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors group"
          >
            <div className="p-1.5 rounded-md group-hover:bg-red-50">
              <LogOut size={18} />
            </div>
            <span>Cerrar Sesión</span>
          </button>
        </form>
      </div>
    </header>
  );
}
