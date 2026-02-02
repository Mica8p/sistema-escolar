"use client";

import { useState, useMemo } from "react";
import type { PersonaWithRelations } from "@/types/persona";
import Link from "next/link";
import { UserPlus, Mail, Fingerprint, Tag, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import DeletePersonaButton from "@/components/modules/personas/DeletePersonaButton";
import EnableAccessButton from "@/components/modules/personas/EnableAccessButton";
import DisablePersonaButton from "@/components/modules/personas/DisablePersonaButton";

interface PersonasClientProps {
  personas: PersonaWithRelations[];
  success?: string;
}

export default function PersonasClient({ personas, success }: PersonasClientProps) {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const availableRoles = useMemo(() => {
    const rolesMap = new Map<number, string>();
    personas.forEach((p) => {
      p.usuario?.roles.forEach((ur) => {
        rolesMap.set(ur.rol.idRol, ur.rol.nombre);
      });
    });
    return Array.from(rolesMap.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [personas]);

  const filteredPersonas = useMemo(() => {
    return personas.filter((p) => {
      const matchesSearch = !search ||
        p.apellido.toLowerCase().includes(search.toLowerCase()) ||
        p.dni.toLowerCase().includes(search.toLowerCase());

      const matchesRole = !selectedRole || p.usuario?.roles.some((r) => r.rol.idRol.toString() === selectedRole);

      return matchesSearch && matchesRole;
    });
  }, [search, selectedRole, personas]);

  const totalPages = Math.ceil(filteredPersonas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPersonas = filteredPersonas.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {success === "true" && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <p className="text-sm font-medium">¡Persona registrada exitosamente!</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Personas</h1>
          <p className="text-slate-500">Listado general de usuarios registrados.</p>
        </div>
        <Link
          href="/dashboard/personas/nuevo"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          <span>Nueva Persona</span>
        </Link>
      </div>
      
      {/* Search Input and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por apellido o DNI..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Resetear a página 1 al buscar
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Fingerprint className="h-5 w-5 text-slate-400" />
          </div>
        </div>

        <select
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
        >
          <option value="">Todos los Roles</option>
          {availableRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.nombre}
            </option>
          ))}
        </select>
      </div>


      {/* Tabla de Datos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nombre y Apellido</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">DNI / Documento</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Roles</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedPersonas.map((p) => {
              const isEnrolled = p.alumno?.matriculas?.length > 0;
              const isAlumno = p.alumno !== null || p.usuario?.roles.some(r => r.rol.nombre.toLowerCase() === 'alumno');

              return (
              <tr key={p.idPersona} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-900">{p.apellido}, {p.nombre}</span>
                    {isEnrolled ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200">Estudiante</span>
                    ) : isAlumno ? null : p.usuario?.estado ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200">Activo</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">Inactivo</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Fingerprint size={14} className="text-slate-400" />
                    {p.dni}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    {p.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {p.usuario?.roles.map((r) => (
                      <span key={r.idRol} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        <Tag size={10} />
                        {r.rol.nombre}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  {!isAlumno && (
                    <>
                      <EnableAccessButton 
                        idPersona={p.idPersona} 
                        dni={p.dni} 
                        isActive={p.usuario?.estado ?? false} 
                      />
                      <DisablePersonaButton 
                        idPersona={p.idPersona} 
                        rol={p.usuario?.roles[0]?.rol?.nombre || ""} 
                        disabled={!p.usuario?.estado} 
                      />
                    </>
                  )}

                  <Link
                    href={`/dashboard/personas/${p.idPersona}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </Link>
                  <DeletePersonaButton idPersona={p.idPersona} />
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-sm text-slate-500">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredPersonas.length)} de {filteredPersonas.length} resultados
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
  );
}
