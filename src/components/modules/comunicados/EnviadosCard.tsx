"use client";

import { useState } from "react";
import { Send, Eye, Calendar, ChevronDown, ChevronUp, Users, Trash2, Edit2 } from "lucide-react";
import { eliminarComunicado } from "@/lib/actions/comunicado-actions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import EditarComunicadoModal from "@/components/modules/comunicados/EditarComunicadoModal";

interface EnviadosCardProps {
  msg: {
    idComunicado: number;
    titulo: string;
    target: string;
    fecha: Date;
    idUsuario: number;
    contenido: string;
    idTarget: number | null;
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
  };
  cursos?: Array<{
    idCurso: number;
    grado: string;
    seccion: string;
    turno: string;
    nivel: string;
  }>;
}

export default function EnviadoCard({ msg, cursos = [] }: EnviadosCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const onConfirmDelete = async () => {
    setIsDeleting(true);
    const res = await eliminarComunicado(msg.idComunicado);
    setIsDeleting(false);
    setShowConfirm(false);
    if (res.error) alert(res.error);
  };

  return (
    <>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
          isDeleting ? "opacity-50 grayscale" : ""
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <Send size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{msg.titulo}</h3>
              <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} /> Para: {msg.target}
                {msg.curso ? (
                  <span className="text-slate-700 font-bold">
                    ({msg.curso.grado}° &quot;{msg.curso.seccion}&quot;)
                  </span>
                ) : msg.idTarget ? (
                  <span className="ml-1 text-slate-700">(ID: {msg.idTarget})</span>
                ) : (
                  ""
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-700 flex items-center justify-end gap-1">
                <Calendar size={12} /> {new Date(msg.fecha).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-1 text-indigo-600 mt-1">
                <Eye size={14} />
                <span className="text-xs font-black">{msg.vistos.length} Vistos</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEdit(true);
                }}
                className="p-3 bg-blue-50 text-blue-400 rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-90"
              >
                <Edit2 size={18} />
              </button>

              <button
                onClick={handleDeleteClick}
                className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
              >
                <Trash2 size={18} />
              </button>

              {isExpanded ? (
                <ChevronUp className="text-slate-300" />
              ) : (
                <ChevronDown className="text-slate-300" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {msg.contenido}
            </p>

            <div className="mt-4 sm:hidden flex justify-between items-center border-t border-slate-50 pt-4">
              <span className="text-[10px] font-bold text-slate-700 tracking-tight">
                Enviado el {new Date(msg.fecha).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1 text-indigo-600 font-black text-xs">
                <Eye size={14} /> {msg.vistos.length}
              </div>
            </div>
          </div>
        )}

      <EditarComunicadoModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        comunicado={msg}
        cursos={cursos}
      />
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        loading={isDeleting}
        onClose={() => setShowConfirm(false)}
        onConfirm={onConfirmDelete}
        title="¿Eliminar comunicado?"
        message="Esta acción es irreversible y el mensaje desaparecerá de las bandejas de todos los destinatarios."
      />
    </>
  );
}