"use client";

import { useRef } from "react";
import { GraduationCap } from "lucide-react";
import { BloqueHorario, DiaHabil } from "@prisma/client";

interface HorarioCompleto {
  diaSemana: string;
  horaInicio: string;
  asignacion: {
    materia: {
      nombre: string;
    };
    curso: {
      grado: string;
      seccion: string;
      turno: string;
    };
    ciclo: {
      anio: number;
    };
    profesor: {
      persona?: {
        apellido: string | null;
      }
    } | null | undefined;
  };
  aula?: string | null;
}
import BotonImprimirHorario from "@/components/BotonDescarga";
import GrillaSemanal from "@/components/modules/horarios/GrillaSemanal";

interface Props {
  horarios: HorarioCompleto[];
  nombreAlumno: string;
  curso: string;
  bloques: BloqueHorario[];
  dias: DiaHabil[];
}

export default function HorarioImprimible({ horarios, nombreAlumno, curso, bloques, dias }: Props) {
  const horarioRef = useRef<HTMLDivElement>(null);
  const anio = horarios?.[0]?.asignacion?.ciclo?.anio || "2026";

  // Validar que tenemos datos necesarios
  if (!horarios || horarios.length === 0 || !bloques || !dias) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Horario de Clases</h3>
        <BotonImprimirHorario contentRef={horarioRef} />
      </div>

      <div
        ref={horarioRef}
        className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm print:p-10 print:border-none print:shadow-none"
      >
        <div className="hidden print:flex items-center justify-between border-b-2 border-indigo-500 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Escuela Digital {anio} </h1>
              <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Gestión Educativa Digital</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-800 uppercase">{nombreAlumno}</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{curso}</p>
          </div>
        </div>


        <GrillaSemanal horarios={horarios} bloques={bloques} dias={dias} />

        <div className="hidden print:flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Documento generado el {new Date().toLocaleDateString()}
          </p>
          <p className="text-[9px] font-black text-indigo-500 uppercase">
            escueladigital.com.ar
          </p>
        </div>
      </div>
    </div>
  );
}