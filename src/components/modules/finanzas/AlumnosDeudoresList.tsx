'use client';

import { useState, useMemo } from 'react';
import { AlumnoConDeuda } from "@/service/finanzas.service";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EstadoBadge = ({ estado }: { estado: "Al día" | "Con Deuda" }) => {
  const className = estado === "Al día"
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}>
      {estado}
    </span>
  );
};

export default function AlumnosDeudoresList({ alumnos }: { alumnos: AlumnoConDeuda[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [cursoFilter, setCursoFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'Con Deuda' | 'Al día'>('Con Deuda');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;

  const cursos = useMemo(() => {
    const cursosSet = new Set(alumnos.map(a => a.curso?.split(' - ')[0]).filter(Boolean));
    return Array.from(cursosSet);
  }, [alumnos]);

  const turnos = useMemo(() => {
    const turnosSet = new Set(alumnos.map(a => a.curso?.split(' - ')[1]).filter(Boolean));
    return Array.from(turnosSet);
  }, [alumnos]);

  const filteredAlumnos = useMemo(() => {
    return alumnos.filter(alumno => {
      const [curso, turno] = alumno.curso?.split(' - ') || ['', ''];
      const searchMatch = searchTerm === '' ||
                          alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (alumno.dni && alumno.dni.toString().includes(searchTerm));
      
      const cursoMatch = cursoFilter === '' || curso === cursoFilter;
      const turnoMatch = turnoFilter === '' || turno === turnoFilter;
      const estadoMatch = alumno.estado === estadoFilter;

      return searchMatch && cursoMatch && turnoMatch && estadoMatch;
    });
  }, [alumnos, cursoFilter, turnoFilter, searchTerm, estadoFilter]);

  const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);
  const paginatedAlumnos = filteredAlumnos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por Apellido, Nombre o DNI"
          className="p-2 border bg-gray-200 text-gray-800 border-gray-300 rounded-md w-full md:w-1/3 placeholder-gray-500"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="p-2 border bg-gray-200 text-gray-800 border-gray-300 rounded-md"
          onChange={(e) => {
            setCursoFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los cursos</option>
          {cursos.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="p-2 border bg-gray-200 text-gray-800 border-gray-300 rounded-md"
          onChange={(e) => {
            setTurnoFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los turnos</option>
          {turnos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="p-2 border bg-gray-200 text-gray-800 border-gray-300 rounded-md"
          value={estadoFilter}
          onChange={(e) => {
            setEstadoFilter(e.target.value as 'Con Deuda' | 'Al día');
            setCurrentPage(1);
          }}
        >
          <option value="Con Deuda">Deudores</option>
          <option value="Al día">Al día</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <div className="align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Legajo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deuda Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ver</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAlumnos.map((alumno) => (
                  <tr key={alumno.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alumno.apellido}, {alumno.nombre}</div>
                      <div className="text-xs text-gray-500">DNI: {alumno.dni}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{alumno.legajo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{alumno.curso}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${alumno.deudaTotal.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EstadoBadge estado={alumno.estado} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/finanzas/${alumno.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Ver Estado de Cuenta
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="text-sm font-bold text-slate-500">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
