import LoginForm from "@/components/modules/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-slate-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sistema Escolar</h1>
          <p className="mt-2 text-sm text-slate-500">Ingresá tus credenciales para continuar</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}