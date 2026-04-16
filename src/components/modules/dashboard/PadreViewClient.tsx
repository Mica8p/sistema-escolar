"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ChevronDown } from "lucide-react";
import CardAsistenciaHijo from "@/components/modules/padres/CardAsistenciaHijo";
import SeccionCalificaciones from "@/components/modules/padres/SeccionCalificaciones";
import HorarioImprimible from "@/components/HorarioImprimible";
import { useRouter } from "next/navigation";

interface PadreViewClientProps {
  hijosData: any[];
}

export default function PadreViewClient({ hijosData }: PadreViewClientProps) {
  const router = useRouter();
  const [hijoSeleccionadoId, setHijoSeleccionadoId] = useState<number>(
    hijosData[0]?.idAlumno || 0
  );

  const hijoSeleccionado = hijosData.find(h => h.idAlumno === hijoSeleccionadoId);

  if (!hijoSeleccionado) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* SELECTOR DE HIJO */}
      {hijosData.length > 1 && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <label className="text-sm font-semibold text-slate-700 block mb-3">
            Seleccionar Hijo
          </label>
          <div className="relative">
            <select
              value={hijoSeleccionadoId}
              onChange={(e) => setHijoSeleccionadoId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer text-base"
            >
              <option value="" disabled>
                -- Seleccionar --
              </option>
              {hijosData.map((hijo) => (
                <option key={hijo.idAlumno} value={hijo.idAlumno}>
                  {hijo.nombreCompleto} - {hijo.curso.grado}° "{hijo.curso.seccion}"
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* INFORMACIÓN DEL HIJO SELECCIONADO */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-visible">
        {/* CABECERA HIJO */}
        <div className="bg-slate-900 p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
              {hijoSeleccionado.nombreCompleto?.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter">
                {hijoSeleccionado.nombreCompleto}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-300">
                {hijoSeleccionado.curso.grado}° "{hijoSeleccionado.curso.seccion}" -{" "}
                {hijoSeleccionado.curso.turno}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = `/dashboard/padres/expediente/${hijoSeleccionado.idAlumno}`;
              }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl transition-all group z-20"
            >
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:scale-110 transition-transform">
                Expediente
              </span>
            </button>

            <Link
              href={`/dashboard/alumnos/${hijoSeleccionado.idMatricula}/boletin`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl transition-all group z-20"
            >
              <FileText
                size={16}
                className="text-indigo-400 group-hover:scale-110 transition-transform"
              />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Ver Boletín Anual
              </span>
            </Link>
          </div>
        </div>

        {/* CONTENIDO HIJO */}
        <div className="p-6 bg-slate-50/20 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <CardAsistenciaHijo hijoData={hijoSeleccionado} />
          </div>
          <div className="lg:col-span-8">
            <SeccionCalificaciones notas={hijoSeleccionado.notas} />
          </div>

          {hijoSeleccionado.horarios && hijoSeleccionado.horarios.length > 0 && (
            <div className="lg:col-span-12 border-t border-slate-100 pt-6">
              <HorarioImprimible
                horarios={hijoSeleccionado.horarios}
                nombreAlumno={hijoSeleccionado.nombreCompleto}
                curso={hijoSeleccionado.curso}
                bloques={hijoSeleccionado.bloques}
                dias={hijoSeleccionado.dias}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
