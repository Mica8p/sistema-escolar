'use client';

import { useState } from 'react';
import { History, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import ReincorporarButton from '@/components/modules/profesores/ReincorporarButton';
import DeleteErrorButton from '@/components/modules/profesores/DeleteErrorButton';

// Define types for better type safety, inferred from usage
interface Persona {
  apellido: string;
  nombre: string;
}

interface ProfesorHistorial {
  persona: Persona;
}

interface Materia {
  nombre: string;
}

interface Curso {
  grado: string;
  seccion: string;
  turno: string;
}

interface HistorialAsignacion {
  idAsignacion: number;
  profesor: ProfesorHistorial | null;
  materia: Materia;
  curso: Curso;
  fechaBaja: Date | null;
}

interface HistorialAsignacionesTableProps {
  historial: HistorialAsignacion[];
}

// Nombres de meses en español
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function HistorialAsignacionesTable({ historial }: HistorialAsignacionesTableProps) {
  const today = new Date();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // Default to current month
  const itemsPerPage = 5; // Mostrar 5 elementos por página

  // Filtrar historial por mes seleccionado
  const filteredHistorial = historial.filter(reg => {
    if (!reg.fechaBaja) return false;
    const fecha = new Date(reg.fechaBaja);
    return fecha.getMonth() === selectedMonth;
  });

  const totalPages = Math.ceil(filteredHistorial.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistorial = filteredHistorial.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filter changes
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="mt-12 space-y-4">
      <h2 className="text-xl font-bold text-slate-500 flex items-center gap-2 px-2 italic">
        <History className="h-6 w-6 text-slate-400" />
        Memoria Académica (Bajas y Reemplazos)
      </h2>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-slate-500" />
            <label htmlFor="month-filter" className="text-sm font-semibold text-slate-600">
              Mes:
            </label>
            <select
              id="month-filter"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MESES.map((mes, index) => (
                <option key={index} value={index}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-slate-500">
            {filteredHistorial.length} registro{filteredHistorial.length !== 1 ? 's' : ''} en {MESES[selectedMonth]}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ex Docente</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Materia / Curso</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedHistorial.length > 0 ? (
              paginatedHistorial.map((reg) => (
                <tr key={reg.idAsignacion} className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="text-slate-700 font-semibold">{reg.profesor ? `${reg.profesor.persona.apellido}, ${reg.profesor.persona.nombre}` : 'Sin asignar'}</p>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {reg.materia.nombre} — {reg.curso.grado}° {reg.curso.seccion} ({reg.curso.turno})
                    </span>
                  </td>
                  <td className="p-4 text-center flex items-center justify-center gap-3">
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-[9px] font-black rounded-lg uppercase tracking-tighter">HISTÓRICO</span>

                    <ReincorporarButton
                      id={reg.idAsignacion}
                      profeNombre={reg.profesor ? `${reg.profesor.persona.apellido}, ${reg.profesor.persona.nombre}` : 'Profesor no asignado'}
                    />

                    <DeleteErrorButton id={reg.idAsignacion} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-10 text-center text-gray-400 italic">
                  No hay bajas registradas en {MESES[selectedMonth]}.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4 px-4 pb-4">
            <div className="text-sm text-slate-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredHistorial.length)} de {filteredHistorial.length} resultados
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-slate-700">Página {currentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}