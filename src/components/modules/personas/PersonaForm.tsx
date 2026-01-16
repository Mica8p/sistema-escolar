"use client";

import { useActionState } from "react";
import {
  createPersonaAction,
  updatePersonaAction,
} from "@/lib/actions/persona-actions";
import {
  User,
  Fingerprint,
  Mail,
  Shield,
  Save,
  X,
  Phone,
  Home,
} from "lucide-react";

interface PersonaFormProps {
  roles: any[];
  initialData?: any; // Si viene este objeto, el formulario entra en modo "Edición"
}

export default function PersonaForm({ roles, initialData }: PersonaFormProps) {
  // 1. Configuramos la acción dinámica
  // Si estamos editando, usamos 'bind' para pasarle el ID a la Server Action automáticamente
  const updateActionWithId = updatePersonaAction.bind(
    null,
    initialData?.idPersona
  );
  const formHandler = initialData ? updateActionWithId : createPersonaAction;

  const [errorMessage, formAction, isPending] = useActionState(
    formHandler,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Sección: Datos Personales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User size={16} /> Nombre
          </label>
          <input
            name="nombre"
            type="text"
            required
            defaultValue={initialData?.nombre}
            className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej: Juan"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User size={16} /> Apellido
          </label>
          <input
            name="apellido"
            type="text"
            required
            defaultValue={initialData?.apellido}
            className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej: Pérez"
          />
        </div>
      </div>

      {/* Sección: Identificación y Contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Fingerprint size={16} /> DNI
          </label>
          <input
            name="dni"
            type="text"
            required
            defaultValue={initialData?.dni}
            className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Solo números"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Mail size={16} /> Correo Electrónico
          </label>
          <input
            name="email"
            type="email"
            required
            defaultValue={initialData?.email}
            className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="correo@ejemplo.com"
          />
        </div>
      </div>
      {/* Sección: Dirección y Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Phone size={16} /> Teléfono
          </label>
          <input
            name="telefono"
            type="text"
            defaultValue={initialData?.telefono}
            className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej: 1122334455"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Home size={16} /> Dirección
          </label>
          <input
            name="direccion"
            type="text"
            defaultValue={initialData?.direccion}
            className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej: Av. Corrientes 1234"
          />
        </div>
      </div>

      {/* Sección: Rol (Solo se muestra al Crear para evitar errores de permisos al editar) */}
      {!initialData && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Shield size={16} /> Rol en el Sistema
          </label>
          <select
            name="idRol"
            required
            className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            <option value="">Seleccioná un rol...</option>
            {roles.map((rol) => (
              <option key={rol.idRol} value={rol.idRol}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mensaje de Error */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          <X size={18} />
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all shadow-md"
        >
          <Save size={18} />
          {isPending
            ? "Procesando..."
            : initialData
            ? "Actualizar Datos"
            : "Registrar Persona"}
        </button>
      </div>
    </form>
  );
}