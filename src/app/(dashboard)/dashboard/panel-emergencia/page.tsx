import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { esDueñoTecnico } from '@/lib/security';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, ShieldAlert } from 'lucide-react';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PanelEmergenciaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Verificar que sea propietario técnico
  const esDueño = esDueñoTecnico(session.user.email);

  if (!esDueño) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h2 className="font-semibold text-red-900 mb-2">Acceso Denegado</h2>
            <p className="text-red-800 mb-4">
              Solo los propietarios técnicos pueden acceder al panel de emergencia.
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

  // Obtener todos los SUPER_ADMIN
  const superAdmins = await db.usuario.findMany({
    where: {
      roles: {
        some: {
          rol: {
            nombre: 'SUPER_ADMIN'
          }
        }
      }
    },
    include: {
      persona: true,
      roles: {
        include: { rol: true }
      }
    }
  });

  // Obtener estadísticas del sistema
  const totalUsuarios = await db.usuario.count();
  const usuariosActivos = await db.usuario.count({
    where: { estado: true }
  });
  const totalRoles = await db.rol.count();

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-red-900">🔴 Panel de Emergencia</h1>
            <p className="text-red-700 text-sm mt-1">
              Acceso de propietario técnico - Usar SOLO en casos de emergencia
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

      {/* Advertencia crítica */}
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 flex items-start gap-3 animate-pulse">
        <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
        <div className="text-sm text-red-800">
          <strong className="block mb-2">⚠️ ADVERTENCIA CRÍTICA</strong>
          <p className="mb-2">
            Este panel es SOLO para emergencias como:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>SUPER_ADMIN olvidó contraseña y no hay otro admin</li>
            <li>Sistema bloqueado por cambios inadecuados</li>
            <li>SUPER_ADMIN se volvió &quot;malo&quot; y bloqueó a todos</li>
            <li>Necesidad de resetear el sistema completo</li>
          </ul>
          <p className="mt-2 font-semibold">
            Todas tus acciones aquí quedan registradas en auditoría.
          </p>
        </div>
      </div>

      {/* Estadísticas del sistema */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{totalUsuarios}</div>
          <div className="text-sm text-slate-600">Usuarios totales</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-green-600">{usuariosActivos}</div>
          <div className="text-sm text-slate-600">Usuarios activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-purple-600">{totalRoles}</div>
          <div className="text-sm text-slate-600">Roles definidos</div>
        </div>
      </div>

      {/* SUPER_ADMIN Management */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">👑</span> Administradores SUPER_ADMIN
        </h2>
        
        {superAdmins.length === 0 ? (
          <p className="text-slate-600 italic">No hay SUPER_ADMIN registrado en el sistema.</p>
        ) : (
          <div className="space-y-3">
            {superAdmins.map(admin => (
              <div key={admin.idUsuario} className="border border-slate-200 rounded-lg p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {admin.persona.nombre} {admin.persona.apellido}
                  </h3>
                  <p className="text-sm text-slate-600">{admin.persona.email}</p>
                  <p className="text-xs text-slate-500">DNI: {admin.persona.dni}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    admin.estado
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {admin.estado ? 'Activo' : 'Deshabilitado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notas de seguridad */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
        <h3 className="font-semibold text-blue-900">📝 Notas de Seguridad</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Eres el único con acceso a este panel (verificado por TECHNICAL_OWNERS)</li>
          <li>Cualquier cambio aquí está auditado automáticamente</li>
          <li>El SUPER_ADMIN es el dueño REAL del sistema, no nosotros</li>
          <li>Solo intervén cuando sea ABSOLUTAMENTE necesario</li>
          <li>Contacta al establecimiento si hay problemas persistentes</li>
        </ul>
      </div>
    </div>
  );
}
