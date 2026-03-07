"use client";

import { useActionState, useState } from "react";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/lib/actions/auth-actions";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPassword, { message: null, isError: false, success: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (state.success) {
    return (
        <div className="text-center">
            <h3 className="text-green-600 font-bold mb-2">¡Contraseña actualizada!</h3>
            <p className="text-sm text-slate-600 mb-4">
                Tu contraseña ha sido cambiada exitosamente.
            </p>
            <a href="/login" className="w-full rounded-xl bg-slate-900 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg hover:bg-indigo-600 transition-all disabled:bg-slate-300">
                Ir a Iniciar Sesión
            </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      
      <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Nueva Contraseña
          </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            name="newPassword"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      
      <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Confirmar Nueva Contraseña
          </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {state?.message && !state.success && (
        <div className={`p-3 rounded-xl text-[10px] font-bold text-center ${state.isError ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-green-50 border border-green-100 text-green-600'}`}>
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-slate-900 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg hover:bg-indigo-600 transition-all disabled:bg-slate-300"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Restablecer Contraseña"}
      </button>
    </form>
  );
}

