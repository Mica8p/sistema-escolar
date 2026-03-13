"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, Users, X, Megaphone, User } from "lucide-react";
import Link from "next/link";
import BotonLeido from "@/components/modules/comunicados/BotonLeido";
import EnviadoCard from "@/components/modules/comunicados/EnviadosCard";

interface FiltroProps {
  data: any[];
  isEnviados?: boolean;
}

export default function FiltroComunicados({ data, isEnviados }: FiltroProps) {
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("TODOS_FILTRO");
  const [dateFilter, setDateFilter] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.titulo.toLowerCase().includes(search.toLowerCase()) ||
        item.contenido.toLowerCase().includes(search.toLowerCase());

      const matchesTarget =
        targetFilter === "TODOS_FILTRO" || item.target === targetFilter;

      const matchesDate =
        !dateFilter || new Date(item.fecha).toLocaleDateString() === new Date(dateFilter + "T12:00:00").toLocaleDateString();

      return matchesSearch && matchesTarget && matchesDate;
    });
  }, [data, search, targetFilter, dateFilter]);

  return (
    <div className="space-y-8">
      {/* --- BARRA DE BUSQUEDA Y FILTROS --- */}
      <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 flex flex-col md:flex-row gap-4 items-center">

        <div className="relative w-full md:flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar por título o contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.8rem] text-sm focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all font-bold text-slate-800 placeholder:text-slate-600 placeholder:font-medium"
          />
        </div>

        <div className="relative w-full md:w-56 group">
          <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="w-full pl-12 pr-8 py-4 bg-indigo-50/30 border border-transparent rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 appearance-none cursor-pointer transition-all text-indigo-700"
          >
            <option value="TODOS_FILTRO">Destinatarios</option>
            <option value="TODOS">Público: Todos</option>
            <option value="PADRES">Sólo Padres</option>
            <option value="DOCENTES">Sólo Docentes</option>
            <option value="CURSO">Cursos Específicos</option>
          </select>
        </div>

        {/*  Filtro Fecha */}
        <div className="relative w-full md:w-52 group">
          <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.8rem] text-xs font-black focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all text-slate-700 uppercase"
          />
        </div>

        {/*  Botón Limpiar */}
        {(search || targetFilter !== "TODOS_FILTRO" || dateFilter) && (
          <button
            onClick={() => {setSearch(""); setTargetFilter("TODOS_FILTRO"); setDateFilter("");}}
            className="p-4 bg-rose-50 text-rose-500 rounded-[1.5rem] hover:bg-rose-100 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-rose-100/50 flex items-center justify-center"
            title="Limpiar filtros"
          >
            <X size={22} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* --- LISTADO --- */}
      <div className="grid gap-6">
        {filteredData.length > 0 ? (
          filteredData.map((msg) => (
            isEnviados ? (
              <EnviadoCard key={msg.idComunicado} msg={msg} />
            ) : (
              <ComunicadoRecibidoCard key={msg.idComunicado} msg={msg} />
            )
          ))
        ) : (
          <div className="p-24 text-center border-2 border-dashed border-slate-200 rounded-[3.5rem] bg-slate-50/30">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300" size={32} />
             </div>
            <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.2em]">No hay resultados para esta búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-componente de tarjeta
function ComunicadoRecibidoCard({ msg }: { msg: any }) {
  const isRead = msg.vistos.length > 0;
  return (
    <div className={`
      relative bg-white p-6 rounded-[2.5rem] border transition-all duration-300
      ${isRead
        ? "border-slate-200 opacity-70 shadow-sm"
        : "border-indigo-200 shadow-2xl shadow-indigo-100/40 ring-1 ring-indigo-50 hover:translate-x-2"}
    `}>
      <Link href={`/dashboard/comunicados/${msg.idComunicado}`} className="absolute inset-0 z-10 rounded-[2.5rem]" />
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isRead ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white shadow-lg shadow-indigo-200"}`}>
            <Megaphone size={22} />
          </div>
          <div className="relative z-20">
            <h3 className={`font-black tracking-tight uppercase text-sm ${isRead ? "text-slate-700" : "text-slate-900"}`}>
              {msg.titulo}
            </h3>
            <div className="flex items-center gap-3 mt-1">
               <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1">
                 <User size={12} className="text-indigo-400" /> {msg.usuario.persona.nombre}
               </p>
               <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${isRead ? 'bg-slate-50 text-slate-700' : 'bg-indigo-50 text-indigo-600'}`}>
                  {msg.target}
               </span>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-black text-slate-700 relative z-20 italic">
          {new Date(msg.fecha).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-slate-700 line-clamp-2 relative z-20 mb-5 pl-16 font-medium leading-relaxed">
        {msg.contenido}
      </p>
      <div className="flex justify-end border-t border-slate-50 pt-4 relative z-30">
        {!isRead ? (
          <BotonLeido idComunicado={msg.idComunicado} />
        ) : (
          <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] italic">Visto por vos</span>
        )}
      </div>
    </div>
  );
}