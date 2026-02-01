"use client";

import { useRef } from "react";
import { GraduationCap, Receipt, Printer } from "lucide-react";
import BotonImprimir from "@/components/BotonDescarga";

interface PagoProps {
  pago: {
    idPago: string;
    monto: number;
    fecha: string;
    metodo: string;
    concepto: string;
  };
  alumno: {
    nombre: string;
    legajo: string;
    curso: string;
  };
}

export default function ComprobantePago({ pago, alumno }: PagoProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  return (
    <div className="inline-block">
      <BotonImprimir
        contentRef={receiptRef}
        label="Ticket"
        variant="slate"
      />

      <div className="hidden">
        <div ref={receiptRef} className="p-10 bg-white text-slate-900 font-sans max-w-[80mm] print:block">
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
            <GraduationCap className="mx-auto text-indigo-600 mb-2" size={40} />
            <h1 className="text-xl font-black uppercase tracking-tighter">Escuela Pro 2026</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Cuit: 30-71234567-8</p>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span>Comprobante:</span>
              <span>#{pago.idPago.slice(-6)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span>Fecha:</span>
              <span>{pago.fecha}</span>
            </div>
          </div>

          <div className="border-y border-slate-200 py-4 mb-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Alumno:</p>
            <p className="text-xs font-black uppercase">{alumno.nombre}</p>
            <p className="text-[9px] font-medium text-slate-500 uppercase">{alumno.curso} - Leg: {alumno.legajo}</p>
          </div>

          <div className="mb-8">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Concepto:</p>
            <p className="text-xs font-bold uppercase">{pago.concepto}</p>
            <div className="flex justify-between items-end mt-4">
               <span className="text-[10px] font-black uppercase">Total Pagado:</span>
               <span className="text-2xl font-black text-indigo-600">${pago.monto}</span>
            </div>
          </div>


          <div className="text-center border-t-2 border-dashed border-slate-300 pt-4">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              Gracias por su compromiso con la educación.
            </p>
            <p className="text-[10px] font-black mt-2">escuelapro.com.ar</p>
          </div>
        </div>
      </div>
    </div>
  );
}