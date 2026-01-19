'use client';

import { useState } from 'react';
import { BookOpen, UserX, Pencil, Clock } from 'lucide-react';
import FormHorario from './FormHorario';
import { desactivarAsignacionAction } from '@/lib/actions/profesor-actions';

export function AsignacionesList({ profesores }: { profesores: any[] }) {
  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<any>(null);

  const openHorarioModal = (asignacion: any) => {
    setSelectedAsignacion(asignacion);
    setIsHorarioModalOpen(true);
  };

  const closeHorarioModal = () => {
    setSelectedAsignacion(null);
    setIsHorarioModalOpen(false);
  };

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
            {profesores.map((profe) => (
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
                  <div className='flex flex-wrap gap-2'>
                    {profe.asignaciones.map((asig: any) => (
                      <span
                        key={asig.idAsignacion}
                        className='inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-1 rounded-full border border-indigo-100'
                      >
                        <BookOpen size={12} />
                        {asig.materia.nombre} ({asig.curso.grado}° {asig.curso.seccion} - {asig.curso.turno})
                      </span>
                    ))}
                  </div>
                </td>

                <td className='p-4'>
                  <div className='flex flex-col gap-2'>
                    {profe.asignaciones.map((asig: any) => (
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
                          onClick={() => openHorarioModal(asig)}
                          className='text-teal-500 hover:text-teal-700 transition-transform hover:scale-110'
                          title={`Gestionar Horarios de ${asig.materia.nombre}`}
                        >
                          <Clock size={18} />
                        </button>

                        <form
                          action={async () => {
                            await desactivarAsignacionAction(
                              asig.idAsignacion
                            );
                          }}
                        >
                          <button
                            type='submit'
                            className='text-orange-500 hover:text-orange-700 transition-transform hover:scale-110'
                            title={`Dar de baja ${asig.materia.nombre}`}
                          >
                            <UserX size={18} />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isHorarioModalOpen && selectedAsignacion && (
        <FormHorario
          asignacion={selectedAsignacion}
          onClose={closeHorarioModal}
        />
      )}
    </>
  );
}
