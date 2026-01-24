// src/components/shared/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/lib/menu-items";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarProps {
  userRoles: string[];
  noLeidos: number; // ✅ Nueva prop
}

export default function Sidebar({ userRoles, noLeidos }: SidebarProps) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>("Académico");

  const hasAccess = (roles: string[]) => roles.some((role) => userRoles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen font-medium">
      <div className="p-6 text-xl font-bold border-b border-slate-800">
        Escuela <span className="text-blue-400">Pro</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!hasAccess(item.roles)) return null;

          // CASO A: Ítem con submenús (Académico, Gestión, etc.)
          if (item.subItems) {
            const isOpen = openGroup === item.title;
            return (
              <div key={item.title} className="flex flex-col">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : item.title)}
                  className="flex justify-between items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white w-full"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span className="text-sm">{item.title}</span>
                  </div>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isOpen && (
                  <div className="ml-9 mt-1 flex flex-col border-l border-slate-700">
                    {item.subItems.map((sub) => (
                      hasAccess(sub.roles) && (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`px-4 py-2 text-xs transition-colors ${
                            pathname === sub.href ? "text-blue-400 font-bold" : "text-slate-500 hover:text-white"
                          }`}
                        >
                          {sub.title}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // CASO B: Ítem simple (Inicio, Inventario, COMUNICADOS)
          const isComunicados = item.title === "Comunicados";

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href ? "bg-blue-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="text-sm">{item.title}</span>
              </div>

              {/* 🔔 BADGE DINÁMICO */}
              {isComunicados && noLeidos > 0 && (
                <span className={`flex items-center justify-center min-w-[18px h-[18px px-1 rounded-full text-[9px] font-black animate-pulse ${
                  pathname === item.href ? "bg-white text-blue-600" : "bg-blue-500 text-white"
                }`}>
                  {noLeidos}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Sesión Activa</p>
        <p className="text-xs text-blue-400 font-bold">{userRoles.join(" / ")}</p>
      </div>
    </aside>
  );
}