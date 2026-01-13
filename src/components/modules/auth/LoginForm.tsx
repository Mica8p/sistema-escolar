"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions/auth-actions";
import { Loader2 } from "lucide-react"; // Recordá tener lucide-react instalado

export default function LoginForm() {
  // useActionState nos permite manejar el estado del error que devuelve el server action
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">DNI</label>
        <input
          name="dni"
          type="text"
          required
          placeholder="Tu número de documento"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Contraseña</label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
        />
      </div>

      {errorMessage && (
        <p className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline- focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Iniciar Sesión"
        )}
      </button>
    </form>
  );
}