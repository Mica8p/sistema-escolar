"use client";
// Componente de seguridad para primer login

import { useActionState, useEffect, useState } from "react";
import { changePasswordAction } from "@/lib/actions/auth-actions";
import { LockKeyhole, Save } from "lucide-react";

export default function FirstLoginModal({ shouldForceChange }: { shouldForceChange?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  // Verificamos si la bandera isDefaultPassword está activa en la sesión
  useEffect(() => {
    if (shouldForceChange) {
      setIsOpen(true);
    }
  }, [shouldForceChange]);

  const [state, formAction, isPending] = useActionState(changePasswordAction, null);

  useEffect(() => {
    if (state?.success) {
      alert("¡Contraseña actualizada! Tu sesión se reiniciará para aplicar los cambios.");
      setIsOpen(false);
      window.location.reload(); // Recarga para asegurar limpieza
    }
  }, [state]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="mx-auto bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <LockKeyhole size={32} />
          </div>
          <h2 className="text-xl font-bold">Bienvenido al Sistema</h2>
          <p className="text-blue-100 text-sm mt-2 leading-relaxed">
            Detectamos que estás usando tu contraseña temporal (DNI). 
            <br/>Por seguridad, debés definir una nueva contraseña privada.
          </p>
        </div>

        <form action={formAction} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={6}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Repetir Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-500"
              placeholder="Repetí la contraseña"
            />
          </div>

          {state?.message && !state.success && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
              ⚠️ {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? "Guardando..." : "Establecer Contraseña Privada"}
            {!isPending && <Save size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}