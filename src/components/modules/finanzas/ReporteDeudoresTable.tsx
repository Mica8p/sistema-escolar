"use client";

import { useRef } from "react";
import BotonImprimir from "@/components/BotonDescarga";
import { GraduationCap, AlertCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";

type Deudor = {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  legajo: string;
  curso: string;
  deudaTotal: number;
  estado: "Al día" | "Con Deuda";
  telefono?: string | null;
  telefonoPadre: string;
  nombrePadre: string;
  deudaFormateada: string;
};

export default function ReporteDeudoresTable({
  deudores,
  totalDeudores,
  montoGlobal,
}: {
  deudores: Deudor[];
  totalDeudores: number;
  montoGlobal: number;
}) {
  const tableRef = useRef<HTMLDivElement>(null);

  const enviarRecordatorio = (alumno: Deudor) => {
    let telefono: string | undefined;
    let mensaje: string;

    const telefonoPadre = alumno.telefonoPadre?.replace(/\D/g, "");
    const telefonoAlumno = alumno.telefono?.replace(/\D/g, "");

    if (telefonoPadre) {
      telefono = telefonoPadre;
      mensaje = encodeURIComponent(
        `Estimado/a *${alumno.nombrePadre}*, le informamos desde *Escuela Pro 2026* que el alumno *${alumno.apellido}, ${alumno.nombre}* presenta una deuda pendiente de *${alumno.deudaFormateada}*. Por favor, solicitamos regularizar el pago. Saludos!`
      );
    } else if (telefonoAlumno) {
      telefono = telefonoAlumno;
      mensaje = encodeURIComponent(
        `Hola *${alumno.nombre}*, te informamos desde *Escuela Pro 2026* que presentas una deuda pendiente de *${alumno.deudaFormateada}*. Por favor, solicitamos regularizar el pago. Saludos!`
      );
    } else {
      return toast.error(
        `No hay un teléfono registrado para el alumno/a o su tutor.`
      );
    }

    window.open(`https://wa.me/${telefono}?text=${mensaje}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <BotonImprimir
          contentRef={tableRef}
          label="Generar PDF del Reporte"
          variant="indigo"
        />
      </div>

      <div
        ref={tableRef}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl print:shadow-none print:border-none print:p-0"
      >
        <div className="hidden print:flex items-center justify-between border-b-2 border-indigo-600 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <GraduationCap className="text-indigo-600" size={40} />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Escuela Pro 2026
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Listado Oficial de Saldos Pendientes
              </p>
            </div>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase">
                Alumno
              </th>
              <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase">
                Curso
              </th>
              <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase">
                Total Deuda
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {deudores.map((alumno) => (
              <tr
                key={alumno.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-4">
                  <p className="text-sm font-black text-slate-800 uppercase">
                    {alumno.apellido}, {alumno.nombre}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400">
                    Legajo: {alumno.legajo}
                  </p>
                </td>
                <td className="px-4 py-4 text-xs font-bold text-slate-500 uppercase">
                  {alumno.curso}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-black text-rose-600">
                    {alumno.deudaFormateada}
                  </span>
                </td>
                <td className="px-4 py-4 text-right print:hidden">
                  <button
                    onClick={() => enviarRecordatorio(alumno)}
                    title="Enviar recordatorio por WhatsApp"
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                  >
                    <MessageCircle size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 p-6 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500">
            <AlertCircle size={16} />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Total deudores: {totalDeudores}
            </p>
          </div>
          <p className="text-lg font-black text-slate-900">
            Monto Global:{" "}
            <span className="text-rose-600">
              ${montoGlobal.toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}