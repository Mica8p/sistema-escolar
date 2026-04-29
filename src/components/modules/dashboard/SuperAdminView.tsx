import db from '@/lib/db';
import AdminManagementClient from '@/app/(dashboard)/dashboard/gestionar-admins/AdminManagementClient';
import { Plus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface SuperAdminViewProps {
  userName: string;
  currentUserEmail: string | undefined;
}

export default async function SuperAdminView({ userName, currentUserEmail }: SuperAdminViewProps) {
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
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900"> Panel de Super Admin</h1>
            <p className="text-slate-600 mt-1">
              Bienvenido, {userName}. Gestiona los administradores del sistema
            </p>
          </div>
        </div>
        <Link 
          href="/dashboard/crear-admin" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus size={18} />
          Crear Admin
        </Link>
      </div>

      {/* Tarjeta con la lista de administradores */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-purple-50 to-blue-50 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">📋 Lista de Administradores</h2>
          <p className="text-sm text-slate-600 mt-1">
            {admins.length} administrador{admins.length !== 1 ? 'es' : ''} en el sistema
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <AdminManagementClient admins={admins} currentUserEmail={currentUserEmail} />
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/dashboard/crear-admin"
          className="p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition"
        >
          <div className="font-semibold text-slate-900 mb-1">➕ Crear Nuevo Admin</div>
          <p className="text-sm text-slate-600">Crear una nueva persona + admin en una operación</p>
        </Link>

        
      </div>
    </div>
  );
}
