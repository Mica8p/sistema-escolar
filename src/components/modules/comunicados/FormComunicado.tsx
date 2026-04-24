"use client";

import { enviarComunicado } from "@/lib/actions/comunicado-actions";
import { Send, Users, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Curso {
  idCurso: number;
  grado: string;
  seccion: string;
  nivel: string;
  turno: string;
}

export default function FormComunicado({ 
  cursos,
  rolPrincipal = "ADMIN"
}: { 
  cursos: Curso[];
  rolPrincipal?: "ADMIN" | "DOCENTE";
}) {
  const [target, setTarget] = useState("TODOS");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await enviarComunicado(formData);
    setLoading(false);

    if (result?.success) {
      router.push("/dashboard/comunicados");
    } else {
      alert(result?.error || "Error al enviar");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">

      {/* TÍTULO */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-2">Título del Mensaje</label>
        <input
          name="titulo"
          required
          placeholder="Ej: Reunión de Padres - 2° B"
          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SELECTOR DE DESTINATARIO */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-2">¿A quién enviamos?</label>
          <div className="relative">
            <select
              name="target"
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)} 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-500 font-bold appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {rolPrincipal === "ADMIN" ? (
                <>
                  <option value="TODOS">Toda la Institución</option>
                  <option value="PADRES">Todos los Padres</option>
                  <option value="DOCENTES">Todos los Docentes</option>
                  <option value="ADMINS">A los Admins</option>
                  <option value="CURSO">Curso: Padres y Docentes</option>
                  <option value="CURSO_PADRES">Curso: Solo Padres</option>
                  <option value="CURSO_DOCENTES">Curso: Solo Docentes</option>
                </>
              ) : (
                <>
                  <option value="ADMINS">A los Admins</option>
                  <option value="PADRES_CURSOS_DOCENTE">Padres de mis cursos</option>
                  <option value="CURSO_PADRES">Padres de un curso específico</option>
                </>
              )}
            </select>
            <Users className="absolute right-4 top-4 text-slate-500 pointer-events-none" size={20} />
          </div>
        </div>

        <div className={`space-y-2 transition-all duration-300 ${(rolPrincipal === "ADMIN" && ["CURSO", "CURSO_PADRES", "CURSO_DOCENTES"].includes(target)) || (rolPrincipal === "DOCENTE" && target === "CURSO_PADRES") ? 'opacity-100' : 'opacity-30'}`}>
          <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-2">Seleccionar Curso</label>
          <div className="relative">
            <select
              name="idTarget"
              disabled={!((rolPrincipal === "ADMIN" && ["CURSO", "CURSO_PADRES", "CURSO_DOCENTES"].includes(target)) || (rolPrincipal === "DOCENTE" && target === "CURSO_PADRES"))}
              required={(rolPrincipal === "ADMIN" && ["CURSO", "CURSO_PADRES", "CURSO_DOCENTES"].includes(target)) || (rolPrincipal === "DOCENTE" && target === "CURSO_PADRES")}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-500 font-bold appearance-none focus:ring-2 focus:ring-indigo-500 outline-none disabled:cursor-not-allowed"
            >
              <option value="">Seleccione un curso...</option>
              {cursos.map(c => (
                <option key={c.idCurso} value={c.idCurso}>
                  {c.grado}° &quot;{c.seccion}&quot; ({c.turno}) - {c.nivel}
                </option>
              ))}
            </select>
            <GraduationCap className="absolute right-4 top-4 text-slate-500 pointer-events-none" size={20} />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-2">Contenido</label>
        <textarea
          name="contenido"
          required
          rows={5}
          placeholder="Escribe aquí el mensaje oficial..."
          className="w-full bg-slate-50 border-none rounded-3xl p-6 text-slate-700 font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:scale-95 active:scale-95"
      >
        {loading ? (
          <span className="animate-pulse">Enviando comunicado...</span>
        ) : (
          <>
            <Send size={16} /> Disparar Comunicado
          </>
        )}
      </button>
    </form>
  );
}