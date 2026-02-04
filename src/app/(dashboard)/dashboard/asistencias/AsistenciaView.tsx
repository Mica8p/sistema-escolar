"use client";

import { useState, useMemo } from "react";
import { CheckCircle, Users } from "lucide-react";
import AsistenciasTable from "@/components/modules/asistencias/AsistenciasTable";
import { EstadoAsistencia } from "@prisma/client";

// Defino las props que recibirá este componente. Serán los datos iniciales que vienen del servidor.
interface Props {
  initialPlanilla: {
    asig: any;
    matriculas: any[];
    asistenciaByMatricula: [number, any][];
  };
  idAsignacion: number;
  idHorario: number;
  fechaISO: string;
  isAdmin: boolean;
}

export default function AsistenciaView({ initialPlanilla, idAsignacion, idHorario, fechaISO, isAdmin }: Props) {
  // 1. GESTIÓN DE ESTADO EN EL CLIENTE
  // Usamos useState para que los cambios en la asistencia se reflejen en la UI.
  const [asistenciaMap, setAsistenciaMap] = useState(new Map<number, any>(initialPlanilla.asistenciaByMatricula));

  // 2. CÁLCULO DEL RESUMEN
  // useMemo recalcula estos valores solo cuando 'asistenciaMap' cambia.
  const { presentes, ausentes } = useMemo(() => {
    let presentes = 0;
    let ausentes = 0;
    for (const registro of asistenciaMap.values()) {
      if (registro.estado === "Presente") presentes++;
      if (registro.estado === "Ausente") ausentes++;
    }
    return { presentes, ausentes };
  }, [asistenciaMap]);

  // 3. FUNCIÓN PARA ACTUALIZAR EL ESTADO
  // Esta función se pasará a AsistenciasTable para que nos notifique de los cambios.
  const handleAsistenciaChange = (idMatricula: number, nuevoEstado: EstadoAsistencia) => {
    setAsistenciaMap(prevMap => {
      const newMap = new Map(prevMap);
      const registroExistente = newMap.get(idMatricula);
      newMap.set(idMatricula, { ...registroExistente, idMatricula, estado: nuevoEstado });
      return newMap;
    });
  };

  return (
    <>
      {/* COLUMNA DE RESUMEN (Ahora con estado) */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center gap-2">
          <CheckCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">3. Resumen</span>
        </div>
        <div className="p-6">
          {initialPlanilla.asig && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                {/* ... otros detalles del resumen ... */}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                  <div className="text-2xl font-black text-emerald-600">{presentes}</div>
                  <div className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Presentes</div>
                </div>
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                  <div className="text-2xl font-black text-rose-600">{ausentes}</div>
                  <div className="text-[9px] font-black text-rose-600 uppercase tracking-tighter">Ausentes</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* PLANILLA (TABLA DE ASISTENCIA) */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
        {initialPlanilla ? (
          <div className="p-4">
            <AsistenciasTable
              idAsignacion={idAsignacion}
              idHorario={idHorario}
              fecha={fechaISO}
              matriculas={initialPlanilla.matriculas}
              asistenciaByMatricula={Array.from(asistenciaMap.entries())}
              readOnly={isAdmin}
              onAsistenciaChange={handleAsistenciaChange} // Pasamos la función de callback
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-300 gap-4">
            <Users size={64} className="opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Seleccioná un bloque horario</p>
          </div>
        )}
      </div>
    </>
  );
}
