import { deletePersonaAction } from "@/lib/actions/persona-actions";
import { PersonaService } from "@/service/persona.service";
import { UserPlus, Mail, Fingerprint, Tag, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import DeletePersonaButton from "@/components/modules/personas/DeletePersonaButton";
import EnableAccessButton from "@/components/modules/personas/EnableAccessButton";

// En Next.js 15, searchParams es una Promise
export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const personas = await PersonaService.getAll();
  const { success } = await searchParams; // Esperamos el parámetro

  return (
    <div className="space-y-6">
      {/* NOTIFICACIÓN DE ÉXITO */}
      {success === "true" && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <p className="text-sm font-medium">¡Persona registrada exitosamente!</p>
        </div>
      )}

      {/* Encabezado (lo que ya tenías) */}
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
            {personas.map((p) => (
              <tr key={p.idPersona} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-900">{p.apellido}, {p.nombre}</span>
                    {p.usuario?.estado ? (
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
                  {/* Botón de Activación / Blanqueo de Clave */}
                  <EnableAccessButton 
                    idPersona={p.idPersona} 
                    dni={p.dni} 
                    isActive={p.usuario?.estado ?? false} 
                  />

                  <Link
                    href={`/dashboard/personas/${p.idPersona}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </Link>

                  {/* ESTA ES LA ÚNICA FORMA DE PASAR INTERACTIVIDAD: UN COMPONENTE SEPARADO */}
                  <DeletePersonaButton idPersona={p.idPersona} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}