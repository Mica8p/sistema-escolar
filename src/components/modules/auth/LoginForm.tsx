"use client";

import { useActionState, useState } from "react";
import { authenticate } from "@/lib/actions/auth-actions";
import { Loader2, User, Lock, Eye, EyeOff, Info } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
          Documento (DNI)
        </label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            name="dni"
            type="text"
            required
            placeholder="Ej: 12345678"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* CAMPO CONTRASEÑA */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Contraseña
            </label>
            <Link
              href="/recuperar-password"
              className="text-[8px] font-black text-indigo-500 uppercase hover:underline"
            >
              ¿Olvidaste tu clave?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              name="password"
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

      <div className="flex gap-2.5 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-indigo-700">
        <Info size={18} className="shrink-0" />
        <p className="text-[10px] font-medium leading-snug">
          <b>¿Primera vez?</b> Tu contraseña es tu número de DNI.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold text-center">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-slate-900 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg hover:bg-indigo-600 transition-all disabled:bg-slate-300"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Ingresar al Portal"}
      </button>
    </form>
  );
}