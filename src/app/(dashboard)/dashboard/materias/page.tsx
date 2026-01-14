import { getAllMaterias } from '@/lib/actions/materia-actions';
import { DeleteMateriaButton } from '@/components/modules/materias/DeleteMateriaButton';
import Link from 'next/link';

export default async function MateriasPage() {
  const materias = await getAllMaterias();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black">Gestión de Materias</h1>
        <Link href="/dashboard/materias/nuevo" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Materia
        </Link>
      </div>
      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Nombre</th>
              <th className="py-3 px-6 text-left">Descripción</th>
              <th className="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {materias.map((materia) => (
              <tr key={materia.idMateria} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{materia.nombre}</td>
                <td className="py-3 px-6 text-left">{materia.descripcion || 'N/A'}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center">
                    <Link href={`/dashboard/materias/${materia.idMateria}`} className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                      </svg>
                    </Link>
                    <DeleteMateriaButton id={materia.idMateria} />
                  </div>
                </td>
              </tr>
            ))}
            {materias.length === 0 && (
              <tr>
                <td colSpan={3} className="py-3 px-6 text-center">No hay materias registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
