"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EstadoAcademico, Curso, Persona } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Fingerprint, Settings2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import GenericDeleteButton from "@/components/shared/GenericDeletButton";
import { deleteMatriculaAction } from "@/lib/actions/alumno-actions";

// Definimos la estructura de la matrícula con el curso asociado
interface MatriculaWithCurso {
  idMatricula: number;
  estadoAcademico: EstadoAcademico;
  curso: Curso;
  // Puedes añadir más propiedades de Matricula si son necesarias
}

// Definimos la estructura del alumno con su persona y matrículas asociadas
interface AlumnoWithPersonaAndMatriculas {
  idAlumno: number;
  legajo: string;
  persona: Persona; 
  matriculas: MatriculaWithCurso[];
}

const StatusBadge = ({ estado }: { estado: EstadoAcademico }) => {
    const baseClasses = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
    const statusStyles: Record<EstadoAcademico, string> = {
      Activo: "bg-green-100 text-green-800",
      Retirado: "bg-red-100 text-red-800",
      Egresado: "bg-blue-100 text-blue-800",
      Suspendido: "bg-yellow-100 text-yellow-800",
    };
    return <span className={cn(baseClasses, statusStyles[estado])}>{estado}</span>;
  }

export function AlumnosClient({ alumnos }: { alumnos: AlumnoWithPersonaAndMatriculas[] }) {
  const [search, setSearch] = useState("");
  const [selectedCurso, setSelectedCurso] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Obtener lista única de cursos
  const cursosDisponibles = useMemo(() => {
    const cursos = new Map();
    alumnos.forEach((alumno) => {
      alumno.matriculas.forEach((matricula) => {
        const cursoKey = `${matricula.curso.idCurso}`;
        if (!cursos.has(cursoKey)) {
          cursos.set(cursoKey, matricula.curso);
        }
      });
    });
    return Array.from(cursos.values()).sort((a, b) => 
      a.grado !== b.grado ? a.grado - b.grado : a.seccion.localeCompare(b.seccion)
    );
  }, [alumnos]);

  const filteredAlumnos = useMemo(() => {
    // Si no hay curso seleccionado, no mostrar ningún alumno
    if (selectedCurso === null) {
      return [];
    }
    
    return alumnos.filter((alumno) => {
      const searchLower = search.toLowerCase();
      const nombreCompleto = `${alumno.persona.nombre} ${alumno.persona.apellido}`.toLowerCase();
      
      // Filtro de búsqueda por nombre/DNI
      const matchesSearch = 
        nombreCompleto.includes(searchLower) ||
        alumno.persona.dni.includes(searchLower);
      
      // Filtro de curso
      const matchesCurso = alumno.matriculas.some(m => m.curso.idCurso === selectedCurso);
      
      return matchesSearch && matchesCurso;
    });
  }, [search, selectedCurso, alumnos]);

  const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlumnos = filteredAlumnos.slice(startIndex, startIndex + itemsPerPage);


  return (
    <>
        <div className="flex gap-4 mb-4 flex-col md:flex-row">
          {/* Selector de Curso */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Filtrar por Curso</label>
            <select
              value={selectedCurso ?? ""}
              onChange={(e) => {
                setSelectedCurso(e.target.value === "" ? null : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
            >
              <option value="">-- Seleccione el curso --</option>
              {cursosDisponibles.map((curso) => (
                <option key={curso.idCurso} value={curso.idCurso}>
                  {curso.grado}° "{curso.seccion}" - {curso.turno}
                </option>
              ))}
            </select>
          </div>

          {/* Buscador por Apellido/DNI */}
          <div className="flex-1 relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Buscar por Apellido o DNI</label>
            <input
              type="text"
              placeholder="Apellido, nombre o DNI..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); 
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 top-8">
              <Fingerprint className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">Listado de Alumnos Inscriptos</h2>
          <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded">
            Total: {filteredAlumnos.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="p-4">Legajo</th>
                <th className="p-4">Apellido y Nombre</th>
                <th className="p-4">DNI</th>
                <th className="p-4">Curso y Turno</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedAlumnos.length > 0 ? (
                paginatedAlumnos.map((alumno) => {
                  const matriculaActual = alumno.matriculas[0];
                  return (
                    <tr key={alumno.idAlumno} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-sm text-blue-600">{alumno.legajo}</td>
                      <td className="p-4 font-medium text-gray-800 uppercase">
                        {alumno.persona.apellido}, {alumno.persona.nombre}
                      </td>
                      <td className="p-4 text-gray-600">{alumno.persona.dni}</td>
                      <td className="p-4">
                        {matriculaActual ? (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            matriculaActual.curso.turno === 'Mañana'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-indigo-100 text-indigo-700' 
                          }`}>
                            {matriculaActual.curso.grado}° &quot;{matriculaActual.curso.seccion}&quot; - {matriculaActual.curso.turno}
                          </span>
                        ) : (
                          <span className="text-red-500 text-xs italic">Sin matrícula</span>
                        )}
                      </td>
                      <td className="p-4">
                        {matriculaActual && <StatusBadge estado={matriculaActual.estadoAcademico} />}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/dashboard/alumnos/${alumno.idAlumno}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm"
                          title="Abrir Expediente Académico"
                        >
                          <Settings2 size={14} />
                          Expediente
                        </Link>

                        {matriculaActual && (

                          <>
                            <div className="w-px h-4 bg-slate-200" />
                            <GenericDeleteButton
                              id={matriculaActual.idMatricula}
                              action={deleteMatriculaAction}
                              title="Eliminar Matrícula"
                              message={`Estás por eliminar la inscripción de ${alumno.persona.nombre} en este ciclo. Esto no borra al alumno del sistema, solo su matrícula actual.`}
                              variant="danger"
                            />

                            <Link
                              href={`/dashboard/alumnos/${matriculaActual.idMatricula}/boletin`}
                              className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-900 transition-all shadow-sm"
                            >
                              <FileText size={14} /> Boletín
                            </Link>
                          </>
                        )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 italic">
                    {selectedCurso === null 
                      ? "Selecciona un curso en el filtro para ver los alumnos inscritos" 
                      : "No hay alumnos que coincidan con los filtros seleccionados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4 px-4 pb-4">
            <div className="text-sm text-slate-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredAlumnos.length)} de {filteredAlumnos.length} resultados
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-slate-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
