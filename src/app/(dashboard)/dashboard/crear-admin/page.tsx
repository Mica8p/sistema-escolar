import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { esSuperAdmin } from '@/lib/security';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import CrearAdminForm from './CrearAdminForm';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function CrearAdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Verificar que sea SUPER_ADMIN
  const esSuper = esSuperAdmin(session.user.roles || [], session.user.email);

  if (!esSuper) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h2 className="font-semibold text-red-900 mb-2">Acceso Denegado</h2>
            <p className="text-red-800 mb-4">
              Solo los Super Admins pueden crear nuevos administradores.
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

  // Obtener todas las personas que NO tienen usuario (para opción "persona existente")
  const personasSinUsuario = await db.persona.findMany({
    where: {
      usuario: null
    },
    select: {
      idPersona: true,
      nombre: true,
      apellido: true,
      email: true,
      dni: true
    }
  });

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">👑 Crear Nuevo Administrador</h1>
          <p className="text-slate-600 mt-1">
            Como SUPER_ADMIN, tienes control total para gestionar administradores
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <CrearAdminForm 
          personas={personasSinUsuario}
        />
      </div>

      {/* Botón volver */}
      <div className="flex justify-start">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
