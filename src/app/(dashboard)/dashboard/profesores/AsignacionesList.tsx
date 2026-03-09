'use client'; 

import { useState, useMemo } from 'react'; 
import { BookOpen, UserX, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { darDeBajaAction } from '@/lib/actions/profesor-actions';
import { toast } from 'sonner';
import BajaMateriaModal from '@/components/modules/profesores/BajaMateriaModal';
import { useRouter } from 'next/navigation'; 

interface Curso {
  grado: string;
  seccion: string;
  turno: string;
}

interface Materia {
  nombre: string;
}

interface Persona {
  idPersona: number;
  apellido: string;
  nombre: string;
  dni: string;
}

interface Suplente {
  idPersona: number;
  nombre: string;
  apellido: string;
}

interface Asignacion {
  idAsignacion: number;
  estado: boolean;
  materia: Materia;
  curso: Curso;
}

interface Profesor {
  idProfesor: number;
  persona: Persona;
  asignaciones: Asignacion[];
}

export function AsignacionesList({ profesores, suplentes }: { profesores: Profesor[], suplentes: Suplente[] }) {
  const router = useRouter(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<{id: number, materia: string} | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const profesoresConAsignacionesActivas = useMemo(() => {
    return profesores.filter(
      (profe) => profe.asignaciones.some((asig) => asig.estado)
    );
  }, [profesores]);

  const totalPages = Math.ceil(profesoresConAsignacionesActivas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProfesores = profesoresConAsignacionesActivas.slice(startIndex, startIndex + itemsPerPage);
  
  const handleBajaClick = (id: number, materia: string) => {
    setSelectedAsignacion({ id, materia });
    setIsModalOpen(true);
  };

  const onConfirmBaja = async (motivo: string, idSuplente?: number) => {
    if (!selectedAsignacion) return;

    setLoading(true);
    const res = await darDeBajaAction(selectedAsignacion.id, motivo, idSuplente);
    setLoading(false);
    setIsModalOpen(false);

    if (res.success) {
      toast.success("Baja procesada correctamente. Se movió a Memoria Académica.");
      router.refresh();
    } else {
      toast.error(res.message);
    }
  };

  const currentProfesorId = selectedAsignacion ? 
    profesores.find(p => p.asignaciones.some(a => a.idAsignacion === selectedAsignacion.id))?.persona.idPersona : undefined;

  const suplentesFiltrados = suplentes.filter(s => s.idPersona !== currentProfesorId);

  return (
    <>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-4 bg-gray-50 border-b border-gray-200'>
          <h2 className='font-bold text-gray-700 uppercase text-sm tracking-wider'>
            Docentes con Actividad Hoy
          </h2>
        </div>
        <table className='w-full text-left'>
          <thead className='bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase'>
            <tr>
              <th className='p-4 w-1/4'>Docente</th>
              <th className='p-4 w-1/2'>Materias y Cursos</th>
              <th className='p-4 w-1/4 text-center'>Acciones</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {paginatedProfesores.length > 0 ? (
              paginatedProfesores.map((profe) => (

              <tr
                key={profe.idProfesor}
                className='hover:bg-gray-50/50 transition-colors'
              >
                <td className='p-4'>
                  <p className='font-bold text-gray-800'>
                    {profe.persona.apellido}, {profe.persona.nombre}
                  </p>
                  <p className='text-xs text-gray-400'>
                    DNI: {profe.persona.dni}
                  </p>
                </td>

                <td className='p-4'>
                  <div className='grid grid-cols-1 gap-2 justify-items-start'>
                    {profe.asignaciones
                      .filter((asig: Asignacion) => asig.estado)
                      .map((asig: Asignacion) => (
                      <div
                        key={asig.idAsignacion}
                        className='flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-1 rounded-full border border-indigo-100'
                      >
                        <BookOpen size={12} />
                        {asig.materia.nombre} ({asig.curso.grado}° {asig.curso.seccion} - {asig.curso.turno})
                      </div>
                    ))}
                  </div>
                </td>

                <td className='p-4'>
                  <div className='flex flex-col gap-2'>
                    {profe.asignaciones
                      .filter((asig: Asignacion) => asig.estado)
                      .map((asig: Asignacion) => (
                      <div
                        key={asig.idAsignacion}
                        className='flex items-center justify-center gap-4 py-1 border-b border-gray-50 last:border-0'
                      >
                        <span className='text-[10px] text-gray-400 font-medium uppercase hidden xl:block'>
                          {asig.materia.nombre} ({asig.curso.turno}):
                        </span>

                        <a
                          href={`?editId=${asig.idAsignacion}`}
                          className='text-blue-500 hover:text-blue-700 transition-transform hover:scale-110'
                          title={`Editar ${asig.materia.nombre}`}
                        >
                          <Pencil size={18} />
                        </a>
                        <button
                          onClick={() => handleBajaClick(asig.idAsignacion, asig.materia.nombre)}
                          className='text-orange-500 hover:text-orange-700 transition-transform hover:scale-110'
                          title={`Dar de baja ${asig.materia.nombre}`}
                        >
                          <UserX size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))
            ) : (
              <tr>
                <td colSpan={3} className="p-10 text-center text-gray-400 italic">
                  No hay docentes con asignaciones activas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4 px-4 pb-4">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, profesoresConAsignacionesActivas.length)} de {profesoresConAsignacionesActivas.length} resultados
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700">Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
      <BajaMateriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmBaja}
        loading={loading}
        title="Dar de Baja Materia"
        materia={selectedAsignacion?.materia || ""}
        suplentes={suplentesFiltrados}
      />
    </>
  );
}
