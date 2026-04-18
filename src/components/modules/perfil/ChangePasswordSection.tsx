"use client";

import { useState, useMemo, useRef } from "react";
import { useActionState } from "react";
import { cambiarPasswordAction } from "@/lib/actions/perfil-actions";
import { AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react";

type ActionState = {
  ok: boolean;
  message: string;
};

const initialState: ActionState = { ok: false, message: "" };

export default function ChangePasswordSection() {
  const [state, formAction] = useActionState(cambiarPasswordAction, initialState);
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  const formRef = useRef<HTMLFormElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmingRef = useRef(false);

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [touched, setTouched] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  const mismatch = useMemo(() => {
    if (!nueva || !confirmar) return false;
    return nueva !== confirmar;
  }, [nueva, confirmar]);

  const minLenError = useMemo(() => {
    if (!nueva) return "";
    return nueva.length < 6 ? "La nueva contraseña debe tener al menos 6 caracteres." : "";
  }, [nueva]);

  const serverActualIncorrect = !state.ok && state.message?.toLowerCase().includes("actual es incorrecta");

  const canSubmit = useMemo(() => {
    if (!actual || !nueva || !confirmar) return false;
    if (mismatch) return false;
    if (minLenError) return false;
    return true;
  }, [actual, nueva, confirmar, mismatch, minLenError]);

  if (state.ok) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-green-900">¡Contraseña actualizada!</p>
          <p className="text-sm text-green-800">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        if (confirmingRef.current) {
          confirmingRef.current = false;
          return;
        }

        setTouched({ actual: true, nueva: true, confirmar: true });

        if (!canSubmit) {
          e.preventDefault();
          return;
        }

        e.preventDefault();
        setConfirmOpen(true);
      }}
      className="space-y-4"
    >
      {/* Contraseña actual */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Contraseña actual</label>
        <div className="relative">
          <input
            name="actual"
            type="text"
            required
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, actual: true }))}
            placeholder="Tu contraseña actual"
            className={`password-input w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 pr-10 ${!showPasswords.actual ? 'password-hidden' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPasswords((p) => ({ ...p, actual: !p.actual }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPasswords.actual ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {touched.actual && !actual && (
          <p className="text-xs font-medium text-red-600">Este campo es obligatorio.</p>
        )}
        {serverActualIncorrect && (
          <p className="text-xs font-medium text-red-600">La contraseña actual es incorrecta.</p>
        )}
      </div>

      {/* Nueva contraseña */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Nueva contraseña</label>
        <div className="relative">
          <input
            name="nueva"
            type="text"
            required
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, nueva: true }))}
            placeholder="Nueva contraseña"
            className={`password-input w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 pr-10 ${!showPasswords.nueva ? 'password-hidden' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPasswords((p) => ({ ...p, nueva: !p.nueva }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPasswords.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {touched.nueva && minLenError && (
          <p className="text-xs font-medium text-red-600">{minLenError}</p>
        )}
      </div>

      {/* Confirmar */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Confirmar nueva contraseña</label>
        <div className="relative">
          <input
            name="confirmar"
            type="text"
            required
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirmar: true }))}
            placeholder="Repetí la nueva contraseña"
            className={`password-input w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 pr-10 ${!showPasswords.confirmar ? 'password-hidden' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPasswords((p) => ({ ...p, confirmar: !p.confirmar }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPasswords.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {touched.confirmar && mismatch && (
          <p className="text-xs font-medium text-red-600">Las contraseñas no coinciden.</p>
        )}
      </div>

      {/* Errores generales */}
      {!state.ok && state.message && !serverActualIncorrect && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-red-600">{state.message}</p>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirmar cambio de contraseña</h3>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro de que deseas cambiar tu contraseña? Deberás ingresar nuevamente con la nueva contraseña.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => {
                  confirmingRef.current = true;
                  setConfirmOpen(false);
                  formRef.current?.requestSubmit();
                }}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
      >
        Cambiar contraseña
      </button>
    </form>
  );
}
