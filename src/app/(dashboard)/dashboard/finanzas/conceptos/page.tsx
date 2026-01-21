import { getConceptosDePago } from "@/service/finanzas.service";
import { ConceptoForm } from "@/components/modules/finanzas/ConceptoForm";

export default async function ConceptosPage() {
  const conceptos = await getConceptosDePago();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Conceptos de Pago</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Columna Izquierda: Listado */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Listado de Conceptos</h2>
              
              {conceptos.length === 0 ? (
                <p className="text-gray-500">No hay conceptos registrados.</p>
              ) : (
                <ul className="grid gap-3">
                  {conceptos.map((concepto) => (
                    <li key={concepto.id} className="flex items-center justify-between p-4 border rounded-md bg-background">
                      <div>
                        <p className="font-medium text-gray-900">{concepto.nombre}</p>
                        {concepto.descripcion && (
                          <p className="text-sm text-gray-500">{concepto.descripcion}</p>
                        )}
                      </div>
                      <div className="font-bold text-lg text-gray-900">
                        ${concepto.montoFijo?.toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        {/* Columna Derecha: Formulario */}
        <div>
          <ConceptoForm />
        </div>
      </div>
    </div>
  );
}