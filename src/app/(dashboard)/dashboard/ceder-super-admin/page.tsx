import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { esSuperAdmin } from '@/lib/security';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Crown } from 'lucide-react';
import CederSuperAdminForm from './CederSuperAdminForm';

export const dynamic = 'force-dynamic';

export default async function CederSuperAdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const esSuperAdminUser = esSuperAdmin(session.user.roles || [], session.user.email);

  if (!esSuperAdminUser) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h2 className="font-semibold text-red-900 mb-2">Acceso Denegado</h2>
            <p className="text-red-800 mb-4">
              Solo los SUPER_ADMIN pueden ceder el control del sistema.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <ArrowLeft size={18} />
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ceder Control SUPER_ADMIN</h1>
            <p className="text-slate-600 text-sm mt-1">
              Transferir el control a una nueva persona en el sistema
            </p>
          </div>
        </div>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
        >
          <ArrowLeft size={18} />
          Volver
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-800">
          <strong className="block mb-2"> ADVERTENCIA</strong>
          <p className="mb-2">
            Esta acción es irreversible. Al ceder el control:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Se creará una nueva persona en el sistema como SUPER_ADMIN</li>
            <li>Perderás acceso administrativo completo</li>
            <li>Solo el nuevo SUPER_ADMIN podrá ceder a otro</li>
            <li>El nuevo SUPER_ADMIN podrá iniciar sesión con su DNI como contraseña inicial</li>
            <li>Al primer ingreso, aparecerá un modal para cambiar su contraseña</li>
            <li>Tu sesión será cerrada automáticamente</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <CederSuperAdminForm />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
        <h3 className="font-semibold text-blue-900">📝 Notas Importantes</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Todos los campos marcados con * son obligatorios</li>
          <li>La contraseña inicial del nuevo SUPER_ADMIN será su DNI</li>
          <li>Ejemplo: Si el DNI es 12345678, la contraseña inicial será 12345678</li>
          <li>Al primer ingreso con su DNI, aparecerá un modal para cambiar la contraseña</li>
          <li>Se recomienda informar al nuevo SUPER_ADMIN sobre esta transferencia</li>
          <li>Deberás ingresar tu contraseña actual para confirmar la transferencia</li>
        </ul>
      </div>
    </div>
  );
}
