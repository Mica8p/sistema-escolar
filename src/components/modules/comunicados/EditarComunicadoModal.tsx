"use client";

import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import { editarComunicado, obtenerCursosDisponibles } from "@/lib/actions/comunicado-actions";

interface EditarComunicadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  comunicado: {
    idComunicado: number;
    titulo: string;
    contenido: string;
    target: string;
    idTarget: number | null;
    curso?: {
      grado: string;
      seccion: string;
    } | null;
  };
  cursos?: Array<{
    idCurso: number;
    grado: string;
    seccion: string;
    turno: string;
    nivel: string;
  }>;
}

export default function EditarComunicadoModal({
  isOpen,
  onClose,
  comunicado,
  cursos = [],
}: EditarComunicadoModalProps) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [target, setTarget] = useState("");
  const [idTarget, setIdTarget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cursosDisponibles, setCursosDisponibles] = useState(cursos);

  useEffect(() => {
    if (isOpen) {
      setTitulo(comunicado.titulo);
      setContenido(comunicado.contenido);
      setTarget(comunicado.target);
      setIdTarget(comunicado.idTarget?.toString() || "");
      
      // Obtener cursos disponibles
      (async () => {
        const result = await obtenerCursosDisponibles();
        if (result.success) {
          setCursosDisponibles(result.cursos);
        }
      })();
    }
  }, [isOpen, comunicado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("contenido", contenido);
    formData.append("target", target);
    if (idTarget) formData.append("idTarget", idTarget);

    const result = await editarComunicado(comunicado.idComunicado, formData);

    setIsLoading(false);

    if (result?.success) {
      onClose();
    } else {
      alert(result?.error || "Error al actualizar");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-black text-slate-800">Editar Comunicado</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
              Título del Mensaje
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Ej: Reunión de Padres - 2° B"
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>

          {/* Target y Curso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                Destinatario
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 font-bold appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="TODOS">Toda la Institución</option>
                <option value="PADRES">Todos los Padres</option>
                <option value="DOCENTES">Todos los Docentes</option>
                <option value="ADMINS">A los Admins</option>
                <option value="CURSO">Curso: Padres y Docentes</option>
                <option value="CURSO_PADRES">Curso: Solo Padres</option>
                <option value="CURSO_DOCENTES">Curso: Solo Docentes</option>
              </select>
            </div>

            {target.includes("CURSO") && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                  Seleccionar Curso
                </label>
                <select
                  value={idTarget}
                  onChange={(e) => setIdTarget(e.target.value)}
                  required={target.includes("CURSO")}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 font-bold appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Seleccione un curso...</option>
                  {cursosDisponibles.map(c => (
                    <option key={c.idCurso} value={c.idCurso}>
                      {c.grado}° &quot;{c.seccion}&quot; ({c.turno}) - {c.nivel}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
              Contenido
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
              rows={6}
              placeholder="Escribe aquí el mensaje oficial..."
              className="w-full bg-slate-50 border-none rounded-3xl p-6 text-slate-700 font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:scale-95 transition-all"
            >
              {isLoading ? (
                <span className="animate-pulse">Guardando...</span>
              ) : (
                <>
                  <Send size={14} /> Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
