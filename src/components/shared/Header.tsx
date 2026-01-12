"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export default function Header({ userName }: { userName?: string | null }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      <div className="text-sm text-slate-500 italic">
        Gestión Escolar v1.0
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <User size={18} className="text-slate-400" />
          {userName}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
        >
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
}