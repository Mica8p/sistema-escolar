"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, Users, X, Megaphone, User } from "lucide-react";
import Link from "next/link";
import EnviadoCard from "@/components/modules/comunicados/EnviadosCard";
import AutoLectura from "@/components/modules/comunicados/AutoLectura";

interface Comunicado {
  idComunicado: number;
  titulo: string;
  target: string;
  fecha: Date;
  contenido: string;
  idTarget: number | null;
  usuario?: {
    persona: {
      nombre: string;
    };
    roles?: Array<{
      rol: {
        nombre: string;
      };
    }>;
  };
  idUsuario: number;
  curso?: {
    grado: string;
    seccion: string;
  } | null;
  vistos: {
    idUsuario: number;
    id: number;
    idComunicado: number;
    fechaLectura: Date;
  }[];
}

interface FiltroProps {
  data: Comunicado[];
  isEnviados?: boolean;
  rolPrincipal?: string;
  idsProfesoresHijos?: number[];
  cursosAsignados?: Array<{ idCurso: number; grado: string; seccion: string; turno: string; nivel: string }>;
}

export default function FiltroComunicados({ data, isEnviados, rolPrincipal, idsProfesoresHijos = [], cursosAsignados = [] }: FiltroProps) {
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("TODOS_FILTRO");
  const [dateFilter, setDateFilter] = useState(() => {
    // Obtener la fecha actual en la zona local sin conversión a UTC
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [cursoFilter, setCursoFilter] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.titulo.toLowerCase().includes(search.toLowerCase()) ||
        item.contenido.toLowerCase().includes(search.toLowerCase());

      let matchesTarget = true;

      // Filtrado para DOCENTES en mensajes enviados
      if (isEnviados && rolPrincipal === "DOCENTE") {
        if (targetFilter === "TODOS_FILTRO") {
          // Mostrar todos los enviados válidos
          matchesTarget = 
            item.target === "ADMINS" || 
            item.target === "PADRES_CURSOS_DOCENTE" ||
            item.target === "CURSO_PADRES";
        } else if (targetFilter === "ADMINS") {
          matchesTarget = item.target === "ADMINS";
        } else if (targetFilter === "PADRES_CURSOS_DOCENTE") {
          matchesTarget = item.target === "PADRES_CURSOS_DOCENTE";
        } else if (targetFilter === "CURSO_PADRES") {
          matchesTarget = item.target === "CURSO_PADRES";
        }
      } 
      // Filtrado diferente para PADRES
      else if (rolPrincipal === "PADRE") {
        if (targetFilter === "TODOS_FILTRO") {
          // Mostrar todos - ya están filtrados en el backend
          matchesTarget = true;
        } else if (targetFilter === "ADMIN") {
          // Del admin: públicos o para padres que NO sean de profesores
          matchesTarget = (item.target === "TODOS" || item.target === "PADRES") && !idsProfesoresHijos.includes(item.idUsuario);
        } else if (targetFilter === "PROFESORES") {
          // De profesores (incluye comunicados PADRES_CURSOS_DOCENTE o de cualquier tipo de profesores de sus hijos)
          // Verificar si es un comunicado de un profesor que tiene cursos con el padre
          matchesTarget = item.target === "PADRES_CURSOS_DOCENTE" || idsProfesoresHijos.includes(item.idUsuario);
        }
      } else {
        // Filtrado original para otros roles
        matchesTarget = targetFilter === "TODOS_FILTRO" || item.target === targetFilter;
      }

      const matchesDate = !dateFilter || (() => {
        // Comparar fechas sin depender de la zona horaria
        const itemDate = new Date(item.fecha);
        const filterDate = new Date(dateFilter + "T00:00:00");
        
        // Usar formato ISO para comparar fechas (YYYY-MM-DD)
        const itemDateString = itemDate.getFullYear() + 
          '-' + String(itemDate.getMonth() + 1).padStart(2, '0') + 
          '-' + String(itemDate.getDate()).padStart(2, '0');
        
        return itemDateString === dateFilter;
      })();

      return matchesSearch && matchesTarget && matchesDate;
    });
  }, [data, search, targetFilter, dateFilter, rolPrincipal, idsProfesoresHijos, isEnviados]);

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

        {/* FILTRO DESLIZABLE - Solo se muestra en Mensajes Enviados o si es PADRE */}
        {(isEnviados || rolPrincipal === "PADRE") && (
          <>
            <div className="relative w-full md:w-72 group">
              <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <select
                value={targetFilter}
                onChange={(e) => {
                  setTargetFilter(e.target.value);
                  setCursoFilter(""); // Reset curso filter cuando cambia target
                }}
                className="w-full pl-12 pr-8 py-4 bg-indigo-50/30 border border-transparent rounded-[1.8rem] text-xs font-bold uppercase tracking-wide focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 appearance-none cursor-pointer transition-all text-indigo-700"
              >
                {rolPrincipal === "PADRE" ? (
                  <>
                    <option value="TODOS_FILTRO">Todos los comunicados</option>
                    <option value="PROFESORES"> Mis profesores </option>
                    <option value="ADMIN"> Administración </option>
                  </>
                ) : isEnviados && rolPrincipal === "DOCENTE" ? (
                  <>
                    <option value="TODOS_FILTRO">Todos los enviados</option>
                    <option value="ADMINS">A los Admins</option>
                    {cursosAsignados.length > 0 && (
                      <>
                        <option value="PADRES_CURSOS_DOCENTE">Padres de todos mis cursos</option>
                        <option value="CURSO_PADRES">Padres de un curso específico</option>
                      </>
                    )}
                  </>
                ) : isEnviados ? (
                  <>
                    <option value="TODOS_FILTRO">Todos los enviados</option>
                    <option value="ADMINS">A los Admins</option>
                    <option value="PADRES">A todos los Padres</option>
                    <option value="CURSO_PADRES">Padres de un curso específico</option>
                    <option value="TODOS">A toda la Institución</option>
                    <option value="DOCENTES">A todos los Docentes</option>
                    <option value="CURSO">Cursos Específicos</option>
                  </>
                ) : null}
              </select>
            </div>

            {/* SEGUNDO FILTRO - Ya no necesario, eliminado */}
          </>
        )}

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
        {(search || targetFilter !== "TODOS_FILTRO" || cursoFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setTargetFilter("TODOS_FILTRO");
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              setDateFilter(`${year}-${month}-${day}`);
              setCursoFilter("");
            }}
            className="p-4 bg-rose-50 text-rose-500 rounded-3xl hover:bg-rose-100 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-rose-100/50 flex items-center justify-center"
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
              <EnviadoCard key={msg.idComunicado} msg={msg} cursos={cursosAsignados} />
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
function ComunicadoRecibidoCard({ msg }: { msg: Comunicado }) {
  const isRead = msg.vistos.length > 0;
  return (
    <>
      <Link 
        href={`/dashboard/comunicados/${msg.idComunicado}`} 
        className={`
          flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-300 hover:scale-102 active:scale-98
          ${isRead
            ? "bg-slate-50 border-slate-200 opacity-70"
            : "bg-white border-indigo-200 shadow-xl shadow-indigo-100/40 ring-1 ring-indigo-50"}
        `}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 ${isRead ? "bg-slate-200 text-slate-400" : "bg-indigo-600 text-white shadow-lg shadow-indigo-200"}`}>
          <Megaphone size={22} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">De:</p>
          <p className={`text-sm font-black truncate ${isRead ? "text-slate-600" : "text-slate-800"}`}>
            {msg.usuario?.persona?.nombre || 'Usuario desconocido'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[9px] font-black text-slate-400 italic whitespace-nowrap">
            {new Date(msg.fecha).toLocaleDateString()}
          </span>
          {!isRead && (
            <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-md shadow-indigo-200 flex-shrink-0"></span>
          )}
          {isRead && (
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">✓</span>
          )}
        </div>
      </Link>
    </>
  );
}