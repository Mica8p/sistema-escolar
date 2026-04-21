"use client";

import { useActionState } from "react";
import { Loader2, Mail, Info } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/auth-actions";

export default function RequestResetForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, { message: "", isError: false });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
          Correo Electrónico
        </label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            name="email"
            type="email"
            required
            placeholder="tu.correo@ejemplo.com"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2.5 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-indigo-700">
        <Info size={18} className="shrink-0" />
        <p className="text-[10px] font-medium leading-snug">
          Recibirás un enlace en tu correo para restablecer tu contraseña. Si no tienes un correo registrado, por favor acércate a la secretaría.
        </p>
      </div>
      
      {state?.message && (
        <div className={`p-3 rounded-xl text-[10px] font-bold text-center ${state.isError ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-green-50 border border-green-100 text-green-600'}`}>
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-slate-900 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg hover:bg-indigo-600 transition-all disabled:bg-slate-300"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Enviar Enlace"}
      </button>
    </form>
  );
}
