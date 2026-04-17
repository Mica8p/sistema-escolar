import { Mail } from "lucide-react";
import Link from "next/link";
import RequestResetForm from "@/components/modules/auth/RequestResetForm";

export default function RecuperarPasswordPage() {
  const anioReal = new Date().getFullYear();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-3xl" />

      <div className="w-full max-w-100 z-10">
        <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100 mb-3">
            <Mail size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            Recuperar Contraseña
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Ingresa tu correo electrónico para recibir un enlace de recuperación.
          </p>
        </div>

        <div className="bg-white p-8 rounded-4xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <RequestResetForm />
        </div>

        <div className="text-center mt-6">
            <Link href="/login" className="text-sm text-indigo-600 hover:underline">
                Volver al inicio de sesión
            </Link>
        </div>

        <p className="mt-6 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Año {anioReal} • v1.0
        </p>
      </div>
    </div>
  );
}
