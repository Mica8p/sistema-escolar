"use client";

import { useState } from "react";
import { ChevronDown, Wallet, DollarSign } from "lucide-react";
import EstadoCuentaSummary from "@/components/modules/finanzas/EstadoCuentaSummary";
import CargosList from "@/components/modules/finanzas/CargosList";
import PagosList from "@/components/modules/finanzas/PagosList";
import { getDetalleCuenta } from "@/service/finanzas.service";
import { Prisma } from "@prisma/client";

type Hijo = Prisma.AlumnoGetPayload<{
  include: { persona: true };
}>;

interface PadreFinanzasViewProps {
  hijos: Hijo[];
  estadosDeCuenta: Awaited<ReturnType<typeof getDetalleCuenta>>[];
}

export default function PadreFinanzasView({ hijos, estadosDeCuenta }: PadreFinanzasViewProps) {
  const [hijoSeleccionadoId, setHijoSeleccionadoId] = useState<number>(0);

  const hijoSeleccionado = hijos.find(h => h.idAlumno === hijoSeleccionadoId);
  const estadoCuentaSeleccionado = estadosDeCuenta.find(e => e.idAlumno === hijoSeleccionadoId);

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <Wallet className="h-8 w-8 text-blue-600" />
        Mis Pagos y Cuotas
      </h1>

      {/* SELECTOR DE HIJO */}
      <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm">
        <label className="text-sm font-semibold text-slate-700 block mb-3">
          Seleccionar Hijo
        </label>
        <div className="relative">
          <select
            value={hijoSeleccionadoId}
            onChange={(e) => setHijoSeleccionadoId(Number(e.target.value))}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer text-base"
          >
            <option value={0}>
              -- Seleccionar Hijo --
            </option>
            {hijos.map((hijo) => (
              <option key={hijo.idAlumno} value={hijo.idAlumno}>
                {hijo.persona.apellido}, {hijo.persona.nombre}
              </option>
            ))}
          </select>
          <ChevronDown
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      {/* INFORMACIÓN DEL HIJO SELECCIONADO */}
      {estadoCuentaSeleccionado && hijoSeleccionado && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {estadoCuentaSeleccionado.persona.nombre[0]}{estadoCuentaSeleccionado.persona.apellido[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {estadoCuentaSeleccionado.persona.apellido}, {estadoCuentaSeleccionado.persona.nombre}
              </h2>
              <p className="text-sm text-gray-500">Legajo: {estadoCuentaSeleccionado.legajo}</p>
            </div>
          </div>

          <EstadoCuentaSummary alumno={estadoCuentaSeleccionado} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Cuotas y Cargos
              </h3>
              <CargosList cargos={estadoCuentaSeleccionado.cargos} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Historial de Pagos
              </h3>
              <PagosList
                pagos={estadoCuentaSeleccionado.pagos}
                alumnoData={{
                  nombre: `${estadoCuentaSeleccionado.persona.nombre} ${estadoCuentaSeleccionado.persona.apellido}`,
                  legajo: estadoCuentaSeleccionado.legajo,
                  curso: estadoCuentaSeleccionado.matriculas?.[0]?.curso
                    ? `${estadoCuentaSeleccionado.matriculas[0].curso.grado}° "${estadoCuentaSeleccionado.matriculas[0].curso.seccion}"`
                    : "Sin curso asignado"
                }}
              />
            </div>
          </div>
        </div>
      )}

      {hijos.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500 italic">No tenés alumnos asociados a tu cuenta.</p>
        </div>
      )}
    </div>
  );
}