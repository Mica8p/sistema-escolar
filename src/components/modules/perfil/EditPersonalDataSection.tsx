"use client";

import { useActionState, useState } from "react";
import { updatePersonalDataAction } from "@/lib/actions/perfil-actions";
import { CheckCircle2, AlertTriangle, Edit2 } from "lucide-react";

type ActionState = {
  ok: boolean;
  message: string;
};

const initialState: ActionState = { ok: false, message: "" };

interface EditPersonalDataSectionProps {
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
}

export default function EditPersonalDataSection({
  nombre: initialNombre,
  apellido: initialApellido,
  email: initialEmail,
  telefono: initialTelefono,
  direccion: initialDireccion,
}: EditPersonalDataSectionProps) {
  const [state, formAction] = useActionState(updatePersonalDataAction, initialState);
  const [isEditing, setIsEditing] = useState(false);

  const [nombre, setNombre] = useState(initialNombre);
  const [apellido, setApellido] = useState(initialApellido);
  const [email, setEmail] = useState(initialEmail || "");
  const [telefono, setTelefono] = useState(initialTelefono || "");
  const [direccion, setDireccion] = useState(initialDireccion || "");

  const canSubmit = nombre.trim() && apellido.trim();

  const handleReset = () => {
    setNombre(initialNombre);
    setApellido(initialApellido);
    setEmail(initialEmail || "");
    setTelefono(initialTelefono || "");
    setDireccion(initialDireccion || "");
    setIsEditing(false);
  };

  if (state.ok && isEditing) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-green-900">¡Datos actualizados!</p>
          <p className="text-sm text-green-800">{state.message}</p>
        </div>
        <button
          onClick={() => setIsEditing(false)}
          className="text-sm font-semibold text-green-700 hover:underline"
        >
          Cerrar
        </button>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
      >
        <Edit2 size={16} />
        Editar datos personales
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Nombre *</label>
          <input
            name="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Apellido *</label>
          <input
            name="apellido"
            type="text"
            required
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Tu apellido"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu.email@ejemplo.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Teléfono</label>
          <input
            name="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Tu teléfono"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {/* Dirección */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Dirección</label>
          <input
            name="direccion"
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Tu dirección"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>

      {/* Errores */}
      {!state.ok && state.message && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-red-600">{state.message}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
