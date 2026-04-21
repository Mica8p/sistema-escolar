export function esDueñoTecnico(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const owners = process.env.TECHNICAL_OWNERS?.split(',').map(e => e.trim()) || [];
  return owners.includes(email);
}

export function esSuperAdmin(
  roles: string[],
  email: string | null | undefined
): boolean {
  return roles.includes('SUPER_ADMIN') || esDueñoTecnico(email);
}

export function puedeGestionarAdmins(
  roles: string[],
  email: string | null | undefined
): boolean {
  return esSuperAdmin(roles, email);
}

export function puedeModificarUsuario(
  rolesActual: string[],
  emailActual: string | null | undefined,
  rolesTarget: string[]
): boolean {
  if (!esSuperAdmin(rolesActual, emailActual)) {
    const targetEsAdmin = rolesTarget.some(r => 
      r === 'ADMIN' || r === 'SUPER_ADMIN'
    );
    
    if (targetEsAdmin) {
      return false;
    }
  }
  
  return true;
}
