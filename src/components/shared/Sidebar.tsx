import Link from "next/link";
import { menuItems } from "@/lib/menu-items";

interface SidebarProps {
  userRoles: string[];
}

export default function Sidebar({ userRoles }: SidebarProps) {
  // Filtramos los items del menú según el rol del usuario
  const filteredMenu = menuItems.filter((item) =>
    item.roles.some((role) => userRoles.includes(role))
  );

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen">
      <div className="p-6 text-xl font-bold border-b border-slate-800">
        Escuela <span className="text-blue-400">Pro</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <item.icon size={20} />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 uppercase font-semibold">Rol Actual</p>
        <p className="text-sm text-blue-400">{userRoles.join(", ")}</p>
      </div>
    </aside>
  );
}