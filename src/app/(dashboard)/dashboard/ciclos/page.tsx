import { CicloService } from "@/service/ciclo.service";
import Link from "next/link";
import { ToggleCicloEstadoButton } from "@/components/modules/ciclos/ToggleCicloEstadoButton";

export default async function CiclosPage() {
  const ciclos = await CicloService.getAll();
  const isAnyActive = ciclos.some(c => c.estado);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black">Gestión de Ciclos Lectivos</h1>
        <Link href="/dashboard/ciclos/nuevo" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Ciclo
        </Link>
      </div>
      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Año</th>
              <th className="py-3 px-6 text-left">Estado</th>
              <th className="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {ciclos.map((ciclo) => (
              <tr key={ciclo.idCiclo} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{ciclo.anio}</td>
                <td className="py-3 px-6 text-left">{ciclo.estado ? <span className="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs">Activo</span> : <span className="bg-red-200 text-red-800 py-1 px-3 rounded-full text-xs">Inactivo</span>}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center">
                    <Link href={`/dashboard/ciclos/${ciclo.idCiclo}`} className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110" title="Editar ciclo">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                      </svg>
                    </Link>
                    <ToggleCicloEstadoButton id={ciclo.idCiclo} estado={ciclo.estado} isAnyActive={isAnyActive} />
                  </div>
                </td>
              </tr>
            ))}
            {ciclos.length === 0 && (
              <tr>
                <td colSpan={3} className="py-3 px-6 text-center">No hay ciclos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}