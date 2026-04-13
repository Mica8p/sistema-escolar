'use client'; 

import { useState } from 'react'; 
import { BookOpen, UserX, Pencil, Calendar } from 'lucide-react';
import { darDeBajaAction } from '@/lib/actions/profesor-actions';
import { toast } from 'sonner';
import BajaMateriaModal from '@/components/modules/profesores/BajaMateriaModal';
import { useRouter } from 'next/navigation'; 
import PaginationControls from '@/components/shared/PaginationControls';

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

interface AsignacionesListProps {
  profesores: Profesor[];
  suplentes: Suplente[];
  currentPage: number;
  totalPages: number;
  selectedDay: string;
}

const diasSemana = [
  { label: 'Lunes', value: 'LUNES' },
  { label: 'Martes', value: 'MARTES' },
  { label: 'Miércoles', value: 'MIERCOLES' },
  { label: 'Jueves', value: 'JUEVES' },
  { label: 'Viernes', value: 'VIERNES' },
  { label: 'Sábado', value: 'SABADO' },
  { label: 'Domingo', value: 'DOMINGO' },
];

export function AsignacionesList({
  profesores,
  suplentes,
  currentPage,
  totalPages,
  selectedDay,
}: AsignacionesListProps) {
  const router = useRouter(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<{id: number, materia: string} | null>(null);

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

  const handleDayChange = (day: string) => {
    router.push(`?day=${day}`);
  };

  const currentProfesorId = selectedAsignacion ? 
    profesores.find(p => p.asignaciones.some(a => a.idAsignacion === selectedAsignacion.id))?.persona.idPersona : undefined;

  const suplentesFiltrados = suplentes.filter(s => s.idPersona !== currentProfesorId);

  const currentDayLabel = diasSemana.find(d => d.value === selectedDay)?.label || 'Hoy';

  return (
    <>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-4 bg-gray-50 border-b border-gray-200'>
          <div className='flex items-center justify-between gap-4 flex-wrap'>
            <h2 className='font-bold text-gray-700 uppercase text-sm tracking-wider'>
              Docentes con Actividad - {currentDayLabel}
            </h2>
            <div className='flex items-center gap-2'>
              <Calendar size={16} className='text-gray-500' />
              <select
                value={selectedDay}
                onChange={(e) => handleDayChange(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'
              >
                {diasSemana.map((dia) => (
                  <option key={dia.value} value={dia.value}>
                    {dia.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            {profesores.length > 0 ? (
              profesores.map((profe) => (

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
         <div className="p-4 bg-gray-50 border-t border-gray-200">
          <PaginationControls currentPage={currentPage} totalPages={totalPages} />
        </div>
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
