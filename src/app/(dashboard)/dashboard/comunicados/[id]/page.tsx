import { getComunicadoById } from "@/service/comunicado.service";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import AutoLectura from "@/components/modules/comunicados/AutoLectura";


export default async function DetalleComunicadoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth();
  const resolvedParams = await params;
  const idNumber = Number(resolvedParams.id);
  const idUsuario = session?.user?.idUsuario;

  if (isNaN(idNumber)) return notFound();

  const comunicado = await getComunicadoById(idNumber);

  if (!comunicado) return notFound();


  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {comunicado.idUsuario !== idUsuario && (
        <AutoLectura id={idNumber} />
      )}

      <Link
        href="/dashboard/comunicados"
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver a la bandeja
      </Link>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="bg-slate-50 p-8 border-b border-slate-100">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100">
              {comunicado.target}
            </span>
            <span className="px-4 py-1.5 bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 flex items-center gap-2">
              <Calendar size={12} /> {new Date(comunicado.fecha).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-tight mb-4 uppercase italic">
            {comunicado.titulo}
          </h1>

          <div className="flex items-center gap-3 text-slate-500">
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <User size={18} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Enviado por</p>
              <p className="text-sm font-bold text-slate-700">
                {comunicado.usuario.persona.apellido}, {comunicado.usuario.persona.nombre}
              </p>
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap font-medium">
              {comunicado.contenido}
            </p>
          </div>
        </div>

        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
             Escuela Digital • Sistema de Gestión Académica
           </p>
           <Tag size={16} className="text-slate-300" />
        </div>
      </div>
    </div>
  );
}