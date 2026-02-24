"use client";

import { useRef } from "react";
import { GraduationCap } from "lucide-react";
import BotonImprimir from "@/components/BotonDescarga";

export default function ComprobantePago({ pago, alumno }: any) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!pago || !alumno) return null;

  const idFinal = String(pago.id || pago.idPago || "000000");

  return (
    <div className="inline-block">
      <BotonImprimir
        contentRef={receiptRef}
        label="Ticket"
        variant="slate"
      />

      <div className="hidden">
        <div
          ref={receiptRef}
          className="p-10 bg-white text-slate-900 font-sans w-[80mm] print:block"
        >
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
            <GraduationCap className="mx-auto text-slate-800 mb-2" size={40} />
            <h1 className="text-xl font-black uppercase tracking-tighter">Escuela Pro 2026</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Cuit: 30-71234567-8</p>
          </div>

          <div className="space-y-1 mb-6">
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="text-slate-400">Comprobante:</span>
              <span>#{idFinal.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="text-slate-400">Fecha:</span>
              <span>{pago.fecha}</span>
            </div>
          </div>

          {/* DATOS ALUMNO */}
          <div className="border-y border-slate-200 py-4 mb-6">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Alumno:</p>
            <p className="text-xs font-black uppercase">{alumno.nombre}</p>
            <p className="text-[9px] font-medium text-slate-500 uppercase">
               {alumno.curso} — Leg: {alumno.legajo}
            </p>
          </div>

          <div className="mb-10">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Concepto:</p>
            <p className="text-xs font-bold uppercase">{pago.concepto}</p>

            <div className="mt-6 flex flex-col items-end">
               <span className="text-[10px] font-black uppercase text-slate-400">Total Pagado:</span>
               <span className="text-3xl font-black text-slate-900">${pago.monto}</span>
            </div>
          </div>

          <div className="text-center border-t-2 border-dashed border-slate-300 pt-4">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Gracias por su compromiso con la educación.<br/>
              Conserve este ticket como comprobante legal.
            </p>
            <p className="text-[10px] font-black mt-3">escuelapro.com.ar</p>
          </div>
        </div>
      </div>
    </div>
  );
}