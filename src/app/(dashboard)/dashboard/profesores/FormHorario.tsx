'use client';

import { useState, useEffect } from 'react';
import {
  createHorario,
  deleteHorario,
  getHorarios,
} from '@/lib/actions/horario-actions';
import { Horario } from '@prisma/client';

interface FormHorarioProps {
  asignacion: any;
  onClose: () => void;
}

export default function FormHorario({
  asignacion,
  onClose,
}: FormHorarioProps) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [diaSemana, setDiaSemana] = useState('Lunes');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  useEffect(() => {
    const fetchHorarios = async () => {
      const data = await getHorarios(asignacion.idAsignacion);
      setHorarios(data);
    };
    fetchHorarios();
  }, [asignacion.idAsignacion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createHorario(
      asignacion.idAsignacion,
      diaSemana,
      horaInicio,
      horaFin
    );
    const data = await getHorarios(asignacion.idAsignacion);
    setHorarios(data);
    setHoraInicio('');
    setHoraFin('');
  };

  const handleDelete = async (idHorario: number) => {
    await deleteHorario(idHorario);
    const data = await getHorarios(asignacion.idAsignacion);
    setHorarios(data);
  };

  return (
    <div className='fixed inset-0 z-50 flex h-screen justify-center items-center bg-black/50'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-1/2'>
        <h2 className='text-2xl font-bold mb-4 text-gray-900'>
          Horarios de {asignacion.materia.nombre} - {asignacion.curso.grado} &quot;
          {asignacion.curso.seccion}&quot; (Prof.{' '}
          {asignacion.profesor.persona.nombre}{' '}
          {asignacion.profesor.persona.apellido})
        </h2>
        <form onSubmit={handleSubmit} className='mb-4'>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-900'>
                Día
              </label>
              <select
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900'
              >
                <option>Lunes</option>
                <option>Martes</option>
                <option>Miércoles</option>
                <option>Jueves</option>
                <option>Viernes</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900'>
                Hora Inicio
              </label>
              <input
                type='time'
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900'>
                Hora Fin
              </label>
              <input
                type='time'
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900'
                required
              />
            </div>
          </div>
          <button
            type='submit'
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
          >
            Agregar Bloque
          </button>
        </form>
        <div>
          <h3 className='text-xl font-bold mb-2 text-gray-900'>Bloques existentes</h3>
          <ul>
            {horarios.map((horario) => (
              <li
                key={horario.idHorario}
                className='flex justify-between items-center mb-2 text-gray-900'
              >
                <span>
                  {horario.diaSemana}:{' '}
                  {new Date(horario.horaInicio).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(horario.horaFin).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <button
                  onClick={() => handleDelete(horario.idHorario)}
                  className='px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600'
                >
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onClose}
          className='mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
