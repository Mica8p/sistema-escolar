
'use client';

import { useSession } from 'next-auth/react';
import { esSuperAdmin, esDueñoTecnico } from '@/lib/security';

interface AdminToolbarProps {
  onGestionarAdmins?: () => void;
  onVerAuditoria?: () => void;
  onPanelEmergencia?: () => void;
}

export function AdminToolbar({
  onGestionarAdmins,
  onVerAuditoria,
  onPanelEmergencia,
}: AdminToolbarProps) {
  const { data: session } = useSession();

  // Verificar permisos del usuario actual
  const esSuper = esSuperAdmin(
    session?.user?.roles || [],
    session?.user?.email
  );

  const esDueño = esDueñoTecnico(session?.user?.email);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {/* Botones visibles para todos los admins */}
      <button className="px-3 py-1 bg-blue-600 text-white rounded">
        Ver Asistencias
      </button>

      {/* Botones SOLO para SUPER_ADMIN */}
      {esSuper && (
        <>
          <button
            onClick={onGestionarAdmins}
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            👥 Gestionar Admins
          </button>
          <button
            onClick={onVerAuditoria}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            📋 Ver Auditoría
          </button>
        </>
      )}

      {/* Botón SOLO para propietarios técnicos (desarrolladores) */}
      {esDueño && (
        <button
          onClick={onPanelEmergencia}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-bold animate-pulse"
        >
          🔴 Panel de Emergencia
        </button>
      )}

      {/* Debug: Mostrar roles (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-600 ml-4 py-1">
          Roles: {session.user.roles?.join(', ') || 'ninguno'}
          {esDueño && ' (🔐 DUEÑO TÉCNICO)'}
        </div>
      )}
    </div>
  );
}

/**
 * ========================================
 * EJEMPLO: Componente de Gestión de Usuarios
 * ========================================
 * 
 * Este componente SOLO se renderiza si el usuario es SUPER_ADMIN
 */

interface UsuarioManagementProps {
  usuarioRoles: string[];
}

export function UsuarioManagement({
  usuarioRoles,
}: UsuarioManagementProps) {
  const { data: session } = useSession();

  const esSuper = esSuperAdmin(
    session?.user?.roles || [],
    session?.user?.email
  );

  // Si NO es SUPER_ADMIN, no renderizar nada
  if (!esSuper) {
    return null;
  }

  // Si llegamos aquí, SOLO SUPER_ADMIN verá esto
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
      <p className="text-sm font-bold mb-2">🔧 Opciones Administrativas</p>

      <div className="flex gap-2 flex-wrap">
        <button className="px-2 py-1 bg-yellow-600 text-white text-sm rounded">
          Cambiar Rol
        </button>
        <button className="px-2 py-1 bg-red-600 text-white text-sm rounded">
          Deshabilitar
        </button>
        <button className="px-2 py-1 bg-blue-600 text-white text-sm rounded">
          Resetear Contraseña
        </button>
      </div>

      {usuarioRoles.includes('SUPER_ADMIN') && (
        <p className="text-xs text-red-600 mt-2">
          ⚠️ Este usuario es SUPER_ADMIN - Solo otro SUPER_ADMIN puede modificarlo
        </p>
      )}
    </div>
  );
}

/**
 * ========================================
 * EJEMPLO: Botón condicional para protegido
 * ========================================
 */

interface ProtectedButtonProps {
  requiredRoles?: string[];
  requiredTechnicalOwner?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ProtectedButton({
  requiredRoles = ['SUPER_ADMIN'],
  requiredTechnicalOwner = false,
  onClick,
  children,
  className = '',
}: ProtectedButtonProps) {
  const { data: session } = useSession();

  const hasRequiredRoles = requiredRoles.some(role =>
    session?.user?.roles?.includes(role)
  );

  const isTechnicalOwner = requiredTechnicalOwner
    ? esDueñoTecnico(session?.user?.email)
    : true;

  const isAllowed = hasRequiredRoles && isTechnicalOwner;

  if (!isAllowed) {
    return null; // No renderizar si no tiene permisos
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
