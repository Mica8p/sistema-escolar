'use client';

import { useState } from 'react';
import { deshabilitarUsuario, habilitarUsuario, resetearContraseñaUsuario } from '@/lib/actions/usuario-actions';
import { Persona, Usuario, Rol, UsuarioRol } from '@prisma/client';
import { toast } from 'sonner';
import { Lock, Unlock, Key, Edit3 } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import Link from 'next/link';

interface AdminWithRelations extends Usuario {
  persona: Persona;
  roles: (UsuarioRol & { rol: Rol })[];
}

interface Props {
  admins: AdminWithRelations[];
  currentUserEmail: string | undefined;
}

interface ConfirmAction {
  type: 'disable' | 'enable' | 'reset' | null;
  adminId: number;
  adminName: string;
  dni?: string;
}

export default function AdminManagementClient({ 
  admins, 
  currentUserEmail
}: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({ type: null, adminId: 0, adminName: '', dni: '' });
  const [rolesFilter, setRolesFilter] = useState<string[]>(['SUPER_ADMIN']);
  const [estadoFilter, setEstadoFilter] = useState<boolean[]>([true]);

  // Filtrar admins según los criterios
  const filteredAdmins = admins.filter(admin => {
    const hasRole = admin.roles.some(ur => rolesFilter.includes(ur.rol.nombre));
    const matchesEstado = estadoFilter.includes(admin.estado);
    return hasRole && matchesEstado;
  });

  const handleDisable = async (idUsuario: number, nombreAdmin: string) => {
    setConfirmAction({ type: 'disable', adminId: idUsuario, adminName: nombreAdmin });
  };

  const handleEnable = async (idUsuario: number, nombreAdmin: string) => {
    setConfirmAction({ type: 'enable', adminId: idUsuario, adminName: nombreAdmin });
  };

  const handleResetPassword = async (idUsuario: number, nombreAdmin: string, dni: string) => {
    setConfirmAction({ type: 'reset', adminId: idUsuario, adminName: nombreAdmin, dni });
  };

  const executeAction = async () => {
    if (confirmAction.type === null) return;

    setLoading(true);
    try {
      if (confirmAction.type === 'disable') {
        await deshabilitarUsuario(confirmAction.adminId);
        toast.success(`${confirmAction.adminName} ha sido deshabilitado`);
      } else if (confirmAction.type === 'enable') {
        await habilitarUsuario(confirmAction.adminId);
        toast.success(`${confirmAction.adminName} ha sido habilitado`);
      } else if (confirmAction.type === 'reset') {
        await resetearContraseñaUsuario(confirmAction.adminId);
        toast.success(`Contraseña de ${confirmAction.adminName} restablecida a su DNI`);
      }
      window.location.reload();
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar la acción';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setConfirmAction({ type: null, adminId: 0, adminName: '', dni: '' });
    }
  };

  const toggleRoleFilter = (role: string) => {
    setRolesFilter(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const toggleEstadoFilter = (estado: boolean) => {
    setEstadoFilter(prev => 
      prev.includes(estado) 
        ? prev.filter(e => e !== estado)
        : [...prev, estado]
    );
  };

  if (admins.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">No hay administradores en el sistema aún.</p>
      </div>
    );
  }

  if (filteredAdmins.length === 0) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">No hay administradores que coincidan con los filtros seleccionados.</p>
          </div>
          <div className="space-y-4 pt-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Filtrar por Rol</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rolesFilter.includes('SUPER_ADMIN')}
                    onChange={() => toggleRoleFilter('SUPER_ADMIN')}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700">SUPER_ADMIN</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rolesFilter.includes('ADMIN')}
                    onChange={() => toggleRoleFilter('ADMIN')}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700">ADMIN</span>
                </label>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Filtrar por Estado</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={estadoFilter.includes(true)}
                    onChange={() => toggleEstadoFilter(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700">✓ Activos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={estadoFilter.includes(false)}
                    onChange={() => toggleEstadoFilter(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700">✗ Deshabilitados</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filtros */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filtro por Rol */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Filtrar por Rol</h3>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolesFilter.includes('SUPER_ADMIN')}
                  onChange={() => toggleRoleFilter('SUPER_ADMIN')}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 text-sm">👑 SUPER_ADMIN</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolesFilter.includes('ADMIN')}
                  onChange={() => toggleRoleFilter('ADMIN')}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 text-sm">ADMIN</span>
              </label>
            </div>
          </div>

          {/* Filtro por Estado */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Filtrar por Estado</h3>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estadoFilter.includes(true)}
                  onChange={() => toggleEstadoFilter(true)}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 text-sm">✓ Activos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estadoFilter.includes(false)}
                  onChange={() => toggleEstadoFilter(false)}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 text-sm">✗ Deshabilitados</span>
              </label>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">Mostrando {filteredAdmins.length} de {admins.length} administrador{admins.length !== 1 ? 'es' : ''}</p>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Nombre</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Email</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">DNI</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Rol</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Estado</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
        {filteredAdmins.map((admin) => {
          const rolPrincipal = admin.roles[0]?.rol.nombre || 'N/A';
          const isSelf = admin.persona.email === currentUserEmail;
          const nombreCompleto = `${admin.persona.nombre} ${admin.persona.apellido}`;

          return (
            <tr key={admin.idUsuario} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">
                    {nombreCompleto}
                  </span>
                  <span className="text-xs text-slate-500">{admin.createdAt.toLocaleDateString('es-AR')}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-700">
                {admin.persona.email || '-'}
              </td>
              <td className="px-6 py-4 text-slate-700 font-mono">
                {admin.persona.dni}
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  rolPrincipal === 'SUPER_ADMIN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {rolPrincipal}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  admin.estado
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {admin.estado ? '✓ Activo' : '✗ Deshabilitado'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {!isSelf ? (
                    <>
                      <button
                        onClick={() => handleResetPassword(admin.idUsuario, nombreCompleto, admin.persona.dni)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                        title="Reestablecer contraseña"
                      >
                        <Key size={14} />
                        Reestablecer
                      </button>
                      {admin.estado ? (
                        <button
                          onClick={() => handleDisable(admin.idUsuario, nombreCompleto)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                          title="Deshabilitar admin"
                        >
                          <Lock size={14} />
                          Deshabilitar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnable(admin.idUsuario, nombreCompleto)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                          title="Habilitar admin"
                        >
                          <Unlock size={14} />
                          Habilitar
                        </button>
                      )}
                      <Link
                        href={`/dashboard/personas/${admin.persona.idPersona}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                        title="Editar información del admin"
                      >
                        <Edit3 size={14} />
                        Editar
                      </Link>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500 italic bg-slate-100 px-3 py-1.5 rounded-lg">
                      Tu usuario (Sin acciones)
                    </span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    <ConfirmModal
      isOpen={confirmAction.type !== null}
      onClose={() => setConfirmAction({ type: null, adminId: 0, adminName: '', dni: '' })}
      onConfirm={executeAction}
      title={
        confirmAction.type === 'disable' ? '¿Deshabilitar admin?' :
        confirmAction.type === 'enable' ? '¿Habilitar admin?' :
        confirmAction.type === 'reset' ? '¿Reestablecer contraseña?' : ''
      }
      message={
        confirmAction.type === 'disable' ? `¿Está seguro que desea deshabilitar a ${confirmAction.adminName}? Se podrá reactivar después.` :
        confirmAction.type === 'enable' ? `¿Está seguro que desea habilitar a ${confirmAction.adminName}?` :
        confirmAction.type === 'reset' ? `¿Desea reestablecer la contraseña de ${confirmAction.adminName}? Se restablecerá a su DNI: ${confirmAction.dni}` : ''
      }
      variant={
        confirmAction.type === 'disable' ? 'warning' :
        confirmAction.type === 'enable' ? 'info' :
        confirmAction.type === 'reset' ? 'warning' : 'danger'
      }
      loading={loading}
    />
    </>
  );
}
