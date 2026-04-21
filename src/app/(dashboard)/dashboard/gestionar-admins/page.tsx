import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { esSuperAdmin } from '@/lib/security';
import db from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Plus } from 'lucide-react';
import AdminManagementClient from './AdminManagementClient';

export const dynamic = 'force-dynamic';

export default async function GestionarAdminsPage() {
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
              Solo los Super Admins pueden gestionar otros administradores.
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

  // Obtener todos los usuarios con roles ADMIN o SUPER_ADMIN
  const admins = await db.usuario.findMany({
    where: {
      roles: {
        some: {
          rol: {
            nombre: {
              in: ['ADMIN', 'SUPER_ADMIN']
            }
          }
        }
      }
    },
    include: {
      persona: true,
      roles: {
        include: { rol: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestionar Administradores</h1>
          <p className="text-slate-600 mt-1">
            Manage admin accounts - enable, disable or create new administrators
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/crear-admin" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={18} />
            Crear Admin
          </Link>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
            Volver
          </Link>
        </div>
      </div>

      {/* Nota de información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>ℹ️ Nota:</strong> Como SUPER_ADMIN tienes control total sobre todos los administradores. Puedes crear nuevos admins, habilitarlos o deshabilitarlos según sea necesario.
        </div>
      </div>

      {/* Tabla de admins */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <AdminManagementClient 
            admins={admins}
            currentUserEmail={session.user.email || undefined}
          />
        </div>
      </div>
    </div>
  );
}
