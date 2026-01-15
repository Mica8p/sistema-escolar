"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/lib/menu-items";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarProps {
  userRoles: string[];
}

export default function Sidebar({ userRoles }: SidebarProps) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>("Académico");

  // Función para verificar si el usuario tiene acceso según su rol
  const hasAccess = (roles: string[]) => roles.some((role) => userRoles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen">
      <div className="p-6 text-xl font-bold border-b border-slate-800">
        Escuela <span className="text-blue-400">Pro</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Si el usuario no tiene acceso al ítem principal, no mostramos nada
          if (!hasAccess(item.roles)) return null;

          // CASO A: Ítem con submenús
          if (item.subItems) {
            const isOpen = openGroup === item.title;
            return (
              <div key={item.title} className="flex flex-col">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : item.title)}
                  className="flex  justify-between gap-3 px-1 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white w-full"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span>{item.title}</span>
                  </div>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {isOpen && (
                  <div className="ml-9 mt-1 flex flex-col border-l border-slate-700">
                    {item.subItems.map((sub) => (
                      hasAccess(sub.roles) && (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`px-4 py-2 text-sm transition-colors ${
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

          // CASO B: Ítem simple (sin submenús)
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 uppercase font-semibold">Rol Actual</p>
        <p className="text-sm text-blue-400">{userRoles.join(", ")}</p>
      </div>
    </aside>
  );
}