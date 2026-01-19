'use client';

import { useState, useEffect } from 'react';
import { createHorario, deleteHorario, getHorarios } from '@/lib/actions/horario-actions';
import { Horario } from '@prisma/client';
import { useRouter } from 'next/navigation';
// Importamos íconos para la notificación
import { CheckCircle2, XCircle } from 'lucide-react';

interface FormHorarioProps {
  asignacion: any;
  onClose: () => void;
}

export default function FormHorario({ asignacion, onClose }: FormHorarioProps) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [diaSemana, setDiaSemana] = useState('LUNES');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  // Estado para la notificación bonita
  const [notificacion, setNotificacion] = useState<{ tipo: 'exito' | 'error', mensaje: string } | null>(null);
  const router = useRouter();

  const fetchHorarios = async () => {
    const data = await getHorarios(asignacion.idAsignacion);
    setHorarios(data);
  };

  useEffect(() => {
    fetchHorarios();
  }, [asignacion.idAsignacion]);

  // Función para mostrar el mensaje y que desaparezca
  const mostrarNotificacion = (tipo: 'exito' | 'error', mensaje: string) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createHorario(asignacion.idAsignacion, diaSemana, horaInicio, horaFin);

    if (res.success) {
      mostrarNotificacion('exito', '¡Bloque horario agregado!');
      await fetchHorarios();
      router.refresh();
      setHoraInicio('');
      setHoraFin('');
    } else {
      mostrarNotificacion('error', 'Error al guardar el horario.');
    }
  };

  const handleDelete = async (idHorario: number) => {
    const res = await deleteHorario(idHorario);
    if (res.success) {
      mostrarNotificacion('exito', 'Horario eliminado.');
      await fetchHorarios();
      router.refresh();
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex h-screen justify-center items-center bg-black/50'>

      {/* EL MENSAJE BONITO (TOAST) */}
      {notificacion && (
        <div className={`fixed top-10 right-10 z-[60 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-bounce ${
          notificacion.tipo === 'exito' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notificacion.tipo === 'exito' ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
          <span className="font-bold">{notificacion.mensaje}</span>
        </div>
      )}

      <div className='bg-white p-6 rounded-lg shadow-lg w-1/2'>
        <h2 className='text-2xl font-bold mb-4 text-gray-900'>
          Horarios de {asignacion.materia.nombre} - {asignacion.curso.grado}° "{asignacion.curso.seccion}"
        </h2>

        {/* FORMULARIO MODELO GABI */}
        <form onSubmit={handleSubmit} className='mb-4'>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-900'>Día</label>
              <select
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-gray-900'
              >
                <option value="LUNES">Lunes</option>
                <option value="MARTES">Martes</option>
                <option value="MIERCOLES">Miércoles</option>
                <option value="JUEVES">Jueves</option>
                <option value="VIERNES">Viernes</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900'>Hora Inicio</label>
              <input
                type='time'
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-gray-900'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900'>Hora Fin</label>
              <input
                type='time'
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-gray-900'
                required
              />
            </div>
          </div>
          <button
            type='submit'
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-bold'
          >
            Agregar Bloque
          </button>
        </form>

        {/* LISTA MODELO GABI */}
        <div>
          <h3 className='text-xl font-bold mb-2 text-gray-900 border-t pt-4'>Bloques existentes</h3>
          <ul className="max-h-48 overflow-y-auto">
            {horarios.length === 0 ? (
              <li className="text-gray-400 italic">No hay horarios cargados aún.</li>
            ) : (
              horarios.map((horario) => (
                <li key={horario.idHorario} className='flex justify-between items-center mb-2 text-gray-900 p-2 bg-gray-50 rounded-md'>
                  <span className="font-medium">
                    {horario.diaSemana}: {horario.horaInicio} - {horario.horaFin}
                  </span>
                  <button
                    onClick={() => handleDelete(horario.idHorario)}
                    className='px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-bold'
                  >
                    Borrar
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <button
          onClick={onClose}
          className='mt-6 w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold'
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}