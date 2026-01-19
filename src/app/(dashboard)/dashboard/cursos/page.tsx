import { getAllCursos } from '@/lib/actions/curso-actions';
import { DeleteCursoButton } from '@/components/modules/cursos/DeleteCursoButton';
import Link from 'next/link';

export default async function CursosPage() {
  const cursos = await getAllCursos();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black">Gestión de Cursos</h1>
        <Link href="/dashboard/cursos/nuevo" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Curso
        </Link>
      </div>
      <div className="bg-white shadow-md rounded my-6 overflow-hidden">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Grado</th>
              <th className="py-3 px-6 text-left">Sección</th>
              <th className="py-3 px-6 text-left">Turno</th>
              <th className="py-3 px-6 text-left">Nivel</th>
              <th className="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {cursos.map((curso) => (
              <tr key={curso.idCurso} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{curso.grado}</td>
                <td className="py-3 px-6 text-left">{curso.seccion}</td>

                {/* Agregamos la celda del Turno con un estilo de etiqueta (badge) */}
                <td className="py-3 px-6 text-left">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    curso.turno === 'Mañana' ? 'bg-orange-100 text-orange-700' :
                    curso.turno === 'Tarde' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {curso.turno}
                  </span>
                </td>

                <td className="py-3 px-6 text-left">{curso.nivel}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center">
                    <Link href={`/dashboard/cursos/${curso.idCurso}`} className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                      </svg>
                    </Link>
                    <DeleteCursoButton id={curso.idCurso} />
                  </div>
                </td>
              </tr>
            ))}
            {cursos.length === 0 && (
              <tr>
                {/* Actualizamos colSpan a 5 porque ahora hay 5 columnas */}
                <td colSpan={5} className="py-3 px-6 text-center">No hay cursos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}