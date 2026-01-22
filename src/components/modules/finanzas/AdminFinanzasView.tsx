"use client";

import { ConceptoForm } from "@/components/modules/finanzas/ConceptoForm";
import ConceptosList from "@/components/modules/finanzas/ConceptosList";
import { GenerarCuotaMasivaDialog } from "@/components/modules/finanzas/generar-cuota-masiva-dialog";
import AlumnosDeudoresList from "@/components/modules/finanzas/AlumnosDeudoresList";
import { Settings, Users, DollarSign } from "lucide-react";

interface Props {
  conceptos: any[];
  alumnosDeudores: any[];
}

export default function AdminFinanzasView({ conceptos, alumnosDeudores }: Props) {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <DollarSign className="h-8 w-8 text-green-600" />
        Administración Financiera
      </h1>

      {/* Panel de Control de Conceptos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ConceptoForm />
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Conceptos de Pago
            </h2>
          </div>
          <ConceptosList 
            conceptos={conceptos} 
            onEdit={(c) => console.log("Editar concepto no implementado aún", c)} 
          />
        </div>
      </div>

      {/* Gestión de Deudas */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-5 h-5" /> Estado de Alumnos
          </h2>
          <GenerarCuotaMasivaDialog conceptos={conceptos} />
        </div>

        <AlumnosDeudoresList alumnos={alumnosDeudores} />
      </div>
    </div>
  );
}