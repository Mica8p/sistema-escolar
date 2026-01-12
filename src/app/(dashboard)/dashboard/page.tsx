import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Bienvenido, {session?.user?.name}
        </h1>
        <p className="text-slate-500">Este es el panel de control institucional.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Alumnos Activos</h3>
          <p className="text-3xl font-bold text-blue-600">--</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Cuotas al Día</h3>
          <p className="text-3xl font-bold text-green-600">--</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Próximos Eventos</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>
    </div>
  );
}