"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EstadoAcademico } from "@prisma/client";
import DeleteMatriculaButton from "@/components/modules/alumnos/DeleteMatriculaButton";
import { cn } from "@/lib/utils";
import { Fingerprint } from "lucide-react";

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

export function AlumnosClient({ alumnos }: { alumnos: any[] }) {
  const [search, setSearch] = useState("");

  const filteredAlumnos = useMemo(() => {
    return alumnos.filter((alumno) => {
      const searchLower = search.toLowerCase();
      const nombreCompleto = `${alumno.persona.nombre} ${alumno.persona.apellido}`.toLowerCase();
      return (
        nombreCompleto.includes(searchLower) ||
        alumno.persona.dni.includes(searchLower)
      );
    });
  }, [search, alumnos]);

  return (
    <>
        <div className="relative flex-1 mb-4">
          <input
            type="text"
            placeholder="Buscar por apellido o DNI..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Fingerprint className="h-5 w-5 text-slate-400" />
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
              {filteredAlumnos.length > 0 ? (
                filteredAlumnos.map((alumno) => {
                  const matriculaActual = alumno.matriculas[0];
                  return (
                    <tr key={alumno.idAlumno} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-sm text-blue-600">{alumno.legajo}</td>
                      <td className="p-4 font-medium text-gray-800 uppercase">
                        {alumno.persona.apellido}, {alumno.persona.nombre} (ID: {alumno.idAlumno})
                      </td>
                      <td className="p-4 text-gray-600">{alumno.persona.dni}</td>
                      <td className="p-4">
                        {matriculaActual ? (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            matriculaActual.curso.turno === 'Mañana'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {matriculaActual.curso.grado}° "{matriculaActual.curso.seccion}" - {matriculaActual.curso.turno}
                          </span>
                        ) : (
                          <span className="text-red-500 text-xs italic">Sin matrícula</span>
                        )}
                      </td>
                      <td className="p-4">
                        {matriculaActual && <StatusBadge estado={matriculaActual.estadoAcademico} />}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <Link href={`/dashboard/alumnos/${alumno.idAlumno}`} className="text-blue-500 hover:text-blue-700 text-xs font-bold">
                          Ver Perfil
                        </Link>
                        {matriculaActual && (
                          <>
                            <span className="text-gray-300">|</span>
                            <DeleteMatriculaButton idMatricula={matriculaActual.idMatricula} />
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 italic">
                    No hay alumnos que coincidan con el estado seleccionado en este ciclo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
