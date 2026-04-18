"use client";

import { useState } from "react";
import { ConceptoForm } from "@/components/modules/finanzas/ConceptoForm";
import ConceptosList from "@/components/modules/finanzas/ConceptosList";
import AlumnosDeudoresList from "@/components/modules/finanzas/AlumnosDeudoresList";
import { Settings, Users, DollarSign } from "lucide-react";
import { ConceptoDePago } from "@prisma/client";
import { AlumnoConDeuda } from "@/service/finanzas.service";

interface Props {
  conceptos: ConceptoDePago[];
  alumnosDeudores: AlumnoConDeuda[];
  esElCicloActivo: boolean;
}

export default function AdminFinanzasView({ conceptos, alumnosDeudores, esElCicloActivo }: Props) {
  const [conceptoAEditar, setConceptoAEditar] = useState<ConceptoDePago | undefined>(undefined);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <DollarSign className="h-8 w-8 text-green-600" />
        Administración Financiera
      </h1>

      {!esElCicloActivo && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span>Solo puedes crear pagos y cuotas en el ciclo lectivo activo. Este es un ciclo archivado para consulta.</span>
        </div>
      )}

      {/* Panel de Control de Conceptos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ConceptoForm
            conceptoAEditar={conceptoAEditar}
            onCancel={() => setConceptoAEditar(undefined)}
            esElCicloActivo={esElCicloActivo}
          />
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Conceptos de Pago
            </h2>
          </div>
          <ConceptosList
            conceptos={conceptos}
            onEdit={(c) => setConceptoAEditar(c)}
          />
        </div>
      </div>

      {/* Gestión de Deudas */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-5 h-5" /> Estado de Alumnos
          </h2>
        </div>

        <AlumnosDeudoresList alumnos={alumnosDeudores} />
      </div>
    </div>
  );
}