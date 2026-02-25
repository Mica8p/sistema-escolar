"use client";

import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cambiarPasswordAction } from "@/lib/actions/perfil-actions";
import { KeyRound, AlertTriangle, CheckCircle2 } from "lucide-react";

type ActionState = {
  ok: boolean;
  message: string;
};

const initialState: ActionState = { ok: false, message: "" };

function ErrorText({ text }: { text?: string | null }) {
  if (!text) return null;
  return <p className="text-xs font-medium text-red-600 mt-1">{text}</p>;
}

export default function CambiarPasswordForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(cambiarPasswordAction, initialState);

  // Modal confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const confirmingRef = useRef(false);

  const successOpen = state.ok;

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [touched, setTouched] = useState<{ actual: boolean; nueva: boolean; confirmar: boolean }>({
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

  const serverActualIncorrect =
    !state.ok && state.message?.toLowerCase().includes("actual es incorrecta");

  const canSubmit = useMemo(() => {
    if (!actual || !nueva || !confirmar) return false;
    if (mismatch) return false;
    if (minLenError) return false;
    return true;
  }, [actual, nueva, confirmar, mismatch, minLenError]);

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cambiar contraseña</h1>
          <p className="text-sm text-slate-500">
            Ingresá tu contraseña actual y definí una nueva.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Contraseña actual</label>
              <input
                name="actual"
                type="password"
                required
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, actual: true }))}
                placeholder="Tu contraseña actual"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              />
              {/* Error: obligatorio */}
              <ErrorText
                text={
                  touched.actual && !actual ? "Este campo es obligatorio." : null
                }
              />
              {/* Error: del server pegado al input */}
              <ErrorText
                text={
                  serverActualIncorrect ? "La contraseña actual es incorrecta." : null
                }
              />
            </div>

            {/* Nueva contraseña */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Nueva contraseña</label>
              <input
                name="nueva"
                type="password"
                required
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, nueva: true }))}
                placeholder="Nueva contraseña"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              />
              <ErrorText text={touched.nueva ? minLenError : null} />
            </div>

            {/* Confirmar */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">
                Confirmar nueva contraseña
              </label>
              <input
                name="confirmar"
                type="password"
                required
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirmar: true }))}
                placeholder="Repetí la nueva contraseña"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              />
              <ErrorText
                text={
                  (touched.confirmar || touched.nueva) && mismatch
                    ? "Las contraseñas no coinciden."
                    : null
                }
              />
            </div>

            {/* Mensajes generales del server */}
            {state.message && !state.ok && !serverActualIncorrect ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                {state.message}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/perfil"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeyRound size={16} />
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal confirmación */}
      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <AlertTriangle size={18} className="text-slate-700" />
              </div>

              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-900">Confirmar cambio</h2>
                <p className="mt-1 text-sm text-slate-600">
                  ¿Estás seguro de realizar el cambio de contraseña?
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                No, cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  confirmingRef.current = true;
                  setConfirmOpen(false);
                  formRef.current?.requestSubmit();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                <KeyRound size={16} />
                Sí, cambiar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal éxito */}
      {successOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <CheckCircle2 size={18} className="text-slate-700" />
              </div>

              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-900">Listo</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {state.message || "Contraseña modificada exitosamente."}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  router.push("/perfil");
                  router.refresh();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
