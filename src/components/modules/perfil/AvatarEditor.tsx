"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAvatarAction, updateAvatarAction } from "@/lib/actions/perfil-actions";

type ActionState = { ok: boolean; message: string };
const initialState: ActionState = { ok: false, message: "" };

function initials(nombre: string, apellido: string) {
  const a = (nombre?.trim()?.[0] ?? "").toUpperCase();
  const b = (apellido?.trim()?.[0] ?? "").toUpperCase();
  return (a + b).slice(0, 2) || "??";
}

function LoadingBar() {
  return (
    <div className="w-36">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/3 animate-[loading_0.9s_ease-in-out_infinite] rounded-full bg-slate-900" />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(80%);
          }
          100% {
            transform: translateX(220%);
          }
        }
      `}</style>
    </div>
  );
}

export default function AvatarEditor({
  idPersona,
  nombre,
  apellido,
  avatarUrl,
  canEdit,
  size = 44,
}: {
  idPersona: number;
  nombre: string;
  apellido: string;
  avatarUrl?: string | null;
  canEdit: boolean;
  size?: number;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [localError, setLocalError] = useState("");
  const [flashMsg, setFlashMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [isPending, startTransition] = useTransition();
  const preview = avatarUrl;

  const pickFile = () => fileRef.current?.click();

  useEffect(() => {
    if (!flashMsg) return;
    const t = setTimeout(() => setFlashMsg(null), 2500);
    return () => clearTimeout(t);
  }, [flashMsg]);

  async function handleUpload(file: File) {
    setLocalError("");
    setFlashMsg(null);

    const okType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!okType) return setLocalError("Formato inválido (JPG/PNG/WEBP).");
    if (file.size > 2 * 1024 * 1024) return setLocalError("La imagen supera 2MB.");

    const fd = new FormData();
    fd.set("idPersona", String(idPersona));
    fd.set("avatar", file);

    startTransition(async () => {
      const res = await updateAvatarAction(initialState, fd);
      setFlashMsg({ text: res.message, ok: res.ok });

      router.refresh();
    });
  }

  async function handleDelete() {
    setLocalError("");
    setFlashMsg(null);

    const fd = new FormData();
    fd.set("idPersona", String(idPersona));

    startTransition(async () => {
      const res = await deleteAvatarAction(initialState, fd);
      setFlashMsg({ text: res.message, ok: res.ok });
      router.refresh();
    });
  }

  const busy = isPending;

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
        style={{ width: size, height: size }}
        title={`${nombre} ${apellido}`}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-700 select-none">
              {initials(nombre, apellido)}
            </span>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-start gap-2">
            {/* input hidden */}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                handleUpload(f);
                e.currentTarget.value = "";
              }}
            />

            <button
              type="button"
              onClick={pickFile}
              disabled={busy}
              className={`w-36 rounded-xl px-3 py-1.5 text-xs font-semibold text-white ${
                busy ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:opacity-90"
              }`}
            >
              {busy ? "Subiendo..." : preview ? "Cambiar foto" : "Subir foto"}
            </button>

            {preview && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className={`w-36 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                  busy
                    ? "cursor-not-allowed border-slate-200 text-slate-400 bg-white"
                    : "border-red-200 bg-white text-red-700 hover:bg-red-50"
                }`}
              >
                {busy ? "Borrando..." : "Borrar foto"}
              </button>
            )}

            {busy && <LoadingBar />}
          </div>

          {(localError || flashMsg) && (
            <p className={`text-xs font-medium ${localError || (flashMsg && !flashMsg.ok) ? "text-red-600" : "text-slate-600"}`}>
              {localError || flashMsg?.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
