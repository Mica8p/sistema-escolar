"use client";

import { useActionState, useEffect, useState } from "react";
import { changePasswordAction } from "@/lib/actions/auth-actions";
import { LockKeyhole, Save } from "lucide-react";
import { toast } from "sonner";

export default function FirstLoginModal({ shouldForceChange }: { shouldForceChange?: boolean }) {
  const [isOpen, setIsOpen] = useState(shouldForceChange || false);

  const [state, formAction, isPending] = useActionState(changePasswordAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("¡Contraseña actualizada!", {
        description: "Tu sesión se reiniciará en breve para aplicar los cambios.",
        duration: 3000,
      });

      const timer = setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (state && !state.success && state.message) {
        toast.error("Error al cambiar contraseña", {
            description: state.message
        });
    }
  }, [state]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-4xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

          <div className="mx-auto bg-white/20 w-16 h-16 rounded-3xl backdrop-blur-md flex items-center justify-center mb-4 shadow-xl border border-white/30 rotate-3">
            <LockKeyhole size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Bienvenido</h2>
          <p className="text-indigo-100 text-xs mt-2 font-medium leading-relaxed opacity-90">
            Detectamos que estás usando tu contraseña temporal.
            <br/>Por seguridad, definí una nueva contraseña privada.
          </p>
        </div>

        <form action={formAction} className="p-8 space-y-6 bg-white">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={6}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Repetir Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium"
              placeholder="Repetí la contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
          >
            {isPending ? "Guardando..." : "Actualizar Contraseña"}
            {!isPending && <Save size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}