import { KeyRound } from "lucide-react";
import ResetPasswordForm from "@/components/modules/auth/ResetPasswordForm";
import Link from "next/link";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage(props: ResetPasswordPageProps) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const anioReal = new Date().getFullYear();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-3xl" />

      <div className="w-full max-w-100 z-10">
        <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100 mb-3">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            Restablecer Contraseña
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Ingresa tu nueva contraseña.
          </p>
        </div>

        <div className="bg-white p-8 rounded-4xl shadow-xl shadow-slate-200/60 border border-slate-100">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="text-center text-red-500">
              <p>Token de restablecimiento no válido o faltante.</p>
              <Link href="/recuperar-password" className="text-indigo-600 hover:underline mt-2 inline-block">
                Solicitar un nuevo enlace
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Año {anioReal} • v1.0
        </p>
      </div>
    </div>
  );
}
