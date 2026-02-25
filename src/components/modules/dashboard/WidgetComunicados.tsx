import { getComunicadosRecibidos } from "@/service/comunicado.service";
import { Megaphone, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function WidgetComunicados({ idUsuario, rol }: { idUsuario: number, rol: string }) {
  const comunicados = await getComunicadosRecibidos(idUsuario, rol);
  const ultimos = comunicados.slice(0, 3);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <Megaphone className="text-indigo-600" size={24} />
          Comunicados Recientes
        </h2>
        <Link href="/dashboard/comunicados" className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-4">
        {ultimos.length > 0 ? ultimos.map((c) => (
          <div key={c.idComunicado} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 transition-colors">
            <div>
              <p className="text-sm font-bold text-slate-700">{c.titulo}</p>
              <p className="text-[10px] text-slate-400 font-medium">{new Date(c.fecha).toLocaleDateString()}</p>
            </div>
            {c.vistos.length === 0 && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200"></span>
            )}
          </div>
        )) : (
          <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">No hay avisos nuevos</p>
        )}
      </div>
    </div>
  );
}