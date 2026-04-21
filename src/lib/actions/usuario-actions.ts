'use server';

/**
 * ========================================
 * USUARIO ACTIONS - CON PROTECCIÓN TÉCNICA
 * ========================================
 * 
 * Todas las acciones que modifican roles/permisos de usuarios
 * están protegidas por la función esSuperAdmin()
 * 
 * Solo SUPER_ADMIN o TECHNICAL_OWNERS pueden:
 * - Crear/modificar roles de otros admins
 * - Deshabilitar otros admins
 * - Cambiar permisos de admins
 */

import db from '@/lib/db';
import { auth } from '@/auth';
import { esSuperAdmin, puedeModificarUsuario } from '@/lib/security';
import { revalidatePath } from 'next/cache';

/**
 * EJEMPLO: Cambiar rol de un usuario
 * 
 * REGLA: Solo SUPER_ADMIN puede cambiar roles de otros ADMIN/SUPER_ADMIN
 */
export async function cambiarRolUsuario(
  idUsuarioTarget: number,
  nuevoNombreRol: string
) {
  // 1. Obtener sesión del usuario actual
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('No autenticado');
  }

  // 2. Verificar que sea SUPER_ADMIN o propietario técnico
  const esSuper = esSuperAdmin(
    session.user.roles || [],
    session.user.email
  );

  if (!esSuper) {
    console.error(`[SEGURIDAD] Usuario ${session.user.email} intentó cambiar rol sin permisos`);
    throw new Error('❌ Solo Super Admin puede cambiar roles');
  }

  // 3. Obtener el usuario target
  const usuarioTarget = await db.usuario.findUnique({
    where: { idUsuario: idUsuarioTarget },
    include: {
      persona: true,
      roles: { include: { rol: true } }
    }
  });

  if (!usuarioTarget) {
    throw new Error('Usuario no encontrado');
  }

  // 4. EXTRA PROTECTION: No dejar que cambien roles de otros SUPER_ADMIN
  // a menos que sea otra sesión de SUPER_ADMIN
  const targetEsSuper = usuarioTarget.roles.some(r => r.rol.nombre === 'SUPER_ADMIN');
  if (targetEsSuper && !esSuper) {
    console.error(`[SEGURIDAD] Intento de modificar SUPER_ADMIN por usuario no autorizado`);
    throw new Error('❌ No puedes modificar permisos de otro Super Admin');
  }

  // 5. Obtener el rol a asignar
  const rol = await db.rol.findUnique({ 
    where: { nombre: nuevoNombreRol } 
  });

  if (!rol) {
    throw new Error(`Rol ${nuevoNombreRol} no existe`);
  }

  // 6. Asignar el rol (upsert = update si existe, create si no)
  await db.usuarioRol.upsert({
    where: { 
      idUsuario_idRol: { 
        idUsuario: idUsuarioTarget, 
        idRol: rol.idRol 
      } 
    },
    create: { 
      idUsuario: idUsuarioTarget, 
      idRol: rol.idRol 
    },
    update: { 
      idRol: rol.idRol 
    }
  });

  console.log(`[AUDIT] ${session.user.email} cambió rol de usuario ${usuarioTarget.persona.email} a ${nuevoNombreRol}`);

  revalidatePath('/dashboard');
  return { success: true, message: `Rol actualizado a ${nuevoNombreRol}` };
}

/**
 * DESHABILITAR USUARIO
 * 
 * REGLAS:
 * - SUPER_ADMIN: Puede deshabilitar a cualquiera
 * - ADMIN: Puede deshabilitar a DOCENTE, PADRE, ALUMNO (NO a otros ADMIN/SUPER_ADMIN)
 */
export async function deshabilitarUsuario(idUsuarioTarget: number) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('No autenticado');
  }

  // Obtener usuario target
  const usuarioTarget = await db.usuario.findUnique({
    where: { idUsuario: idUsuarioTarget },
    include: {
      persona: true,
      roles: { include: { rol: true } }
    }
  });

  if (!usuarioTarget) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar permisos usando la función de seguridad
  const targetRoles = usuarioTarget.roles.map(ur => ur.rol.nombre);
  const puedeModificar = puedeModificarUsuario(
    session.user.roles || [],
    session.user.email,
    targetRoles
  );

  if (!puedeModificar) {
    console.error(`[SEGURIDAD] ${session.user.email} intentó deshabilitar a ${usuarioTarget.persona.email} sin permisos`);
    throw new Error('❌ No tienes permiso para deshabilitar a este usuario');
  }

  // Deshabilitar
  await db.usuario.update({
    where: { idUsuario: idUsuarioTarget },
    data: { estado: false }
  });

  console.log(`[AUDIT] ${session.user.email} deshabilitó usuario ${usuarioTarget.persona.email}`);

  revalidatePath('/dashboard');
  return { success: true, message: 'Usuario deshabilitado' };
}

/**
 * EJEMPLO: Habilitar usuario
 * 
 * REGLA: Solo SUPER_ADMIN puede habilitar a otros ADMIN/SUPER_ADMIN
 */
export async function habilitarUsuario(idUsuarioTarget: number) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('No autenticado');
  }

  const usuarioTarget = await db.usuario.findUnique({
    where: { idUsuario: idUsuarioTarget },
    include: {
      persona: true,
      roles: { include: { rol: true } }
    }
  });

  if (!usuarioTarget) {
    throw new Error('Usuario no encontrado');
  }

  const puedeModificar = puedeModificarUsuario(
    session.user.roles || [],
    session.user.email,
    usuarioTarget.roles.map(ur => ur.rol.nombre)
  );

  if (!puedeModificar) {
    throw new Error('❌ No tienes permiso para habilitar este usuario');
  }

  await db.usuario.update({
    where: { idUsuario: idUsuarioTarget },
    data: { estado: true }
  });

  console.log(`[AUDIT] ${session.user.email} habilitó usuario ${usuarioTarget.persona.email}`);

  revalidatePath('/dashboard');
  return { success: true, message: 'Usuario habilitado' };
}

/**
 * REESTABLECER CONTRASEÑA A DNI
 * 
 * REGLAS:
 * - SUPER_ADMIN: Puede resetear contraseña de cualquiera
 * - ADMIN: Puede resetear solo de DOCENTE, PADRE, ALUMNO (NO de otros ADMIN/SUPER_ADMIN)
 */
export async function resetearContraseñaUsuario(
  idUsuario: number
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('No autenticado');
  }

  // Obtener el usuario target
  const usuario = await db.usuario.findUnique({
    where: { idUsuario },
    include: { 
      persona: true,
      roles: { include: { rol: true } }
    }
  });

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar permisos usando la función de seguridad
  const targetRoles = usuario.roles.map(ur => ur.rol.nombre);
  const puedeModificar = puedeModificarUsuario(
    session.user.roles || [],
    session.user.email,
    targetRoles
  );

  if (!puedeModificar) {
    console.error(`[SEGURIDAD] ${session.user.email} intentó resetear contraseña de ${usuario.persona.email} sin permisos`);
    throw new Error('❌ No tienes permiso para resetear la contraseña de este usuario');
  }

  // Hash password con el DNI
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(usuario.persona.dni, 10);

  // Actualizar contraseña
  await db.usuario.update({
    where: { idUsuario },
    data: {
      passwordHash,
      defaultPassword: true // Forzar cambio en siguiente login
    }
  });

  console.log(`[AUDIT] ${session.user.email} reseteó contraseña de ${usuario.persona.email} al DNI`);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/gestionar-admins');
  return { 
    success: true, 
    message: `Contraseña restablecida al DNI: ${usuario.persona.dni}` 
  };
}

/**
 * CREAR NUEVO ADMIN
 * 
 * PROTECCIÓN: Solo SUPER_ADMIN puede crear nuevos administradores
 * No permite que un ADMIN común cree otro ADMIN
 */
export async function crearAdminNuevo(
  idPersona: number,
  contraseña: string,
  rol: string = 'ADMIN'
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('No autenticado');
  }

  // ⭐ PROTECCIÓN CRÍTICA: Solo SUPER_ADMIN puede crear admins
  const esSuper = esSuperAdmin(
    session.user.roles || [],
    session.user.email
  );

  if (!esSuper) {
    console.error(`[SEGURIDAD] ${session.user.email} intentó crear admin sin ser SUPER_ADMIN`);
    throw new Error('❌ Solo SUPER_ADMIN puede crear nuevos administradores');
  }

  // Validar contraseña
  if (!contraseña || contraseña.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }

  // Validar rol
  if (!['ADMIN', 'SUPER_ADMIN'].includes(rol)) {
    throw new Error('Rol inválido');
  }

  // Obtener persona
  const persona = await db.persona.findUnique({
    where: { idPersona }
  });

  if (!persona) {
    throw new Error('Persona no encontrada');
  }

  // Verificar que no tenga usuario ya
  const usuarioExistente = await db.usuario.findUnique({
    where: { idPersona }
  });

  if (usuarioExistente) {
    throw new Error('Esta persona ya tiene una cuenta de usuario');
  }

  // Hash password
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(contraseña, 10);

  // Obtener rol de la BD
  const rolDB = await db.rol.findUnique({
    where: { nombre: rol }
  });

  if (!rolDB) {
    throw new Error(`Rol ${rol} no existe en la base de datos`);
  }

  // Crear usuario con rol
  const nuevoUsuario = await db.usuario.create({
    data: {
      idPersona,
      passwordHash,
      estado: true,
      defaultPassword: true, // Forzar cambio de contraseña en primer login
      roles: {
        create: {
          idRol: rolDB.idRol
        }
      }
    },
    include: {
      persona: true,
      roles: { include: { rol: true } }
    }
  });

  console.log(`[AUDIT] ${session.user.email} creó nuevo admin ${rol}: ${persona.nombre} ${persona.apellido} (${persona.email})`);

  revalidatePath('/dashboard');
  return {
    success: true,
    message: `Admin creado correctamente`,
    personaNombre: `${persona.nombre} ${persona.apellido}`,
    usuario: nuevoUsuario
  };
}

/**
 * CREAR ADMIN CON PERSONA
 * 
 * PROTECCIÓN: Solo SUPER_ADMIN puede crear nuevos administradores
 * Esta función permite crear una persona Y un admin en una sola operación
 * Sin necesidad de que la persona exista previamente
 */
export async function crearAdminConPersona(
  nombre: string,
  apellido: string,
  email: string,
  dni: string,
  contraseña: string,
  rol: string = 'ADMIN'
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('No autenticado');
  }

  // ⭐ PROTECCIÓN CRÍTICA: Solo SUPER_ADMIN puede crear admins
  const esSuper = esSuperAdmin(
    session.user.roles || [],
    session.user.email
  );

  if (!esSuper) {
    console.error(`[SEGURIDAD] ${session.user.email} intentó crear admin sin ser SUPER_ADMIN`);
    throw new Error('❌ Solo SUPER_ADMIN puede crear nuevos administradores');
  }

  // Validar datos
  if (!nombre || !apellido || !email || !dni) {
    throw new Error('Todos los campos son obligatorios');
  }

  if (!contraseña || contraseña.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(rol)) {
    throw new Error('Rol inválido');
  }

  // Verificar que no exista persona con ese DNI
  const personaExistente = await db.persona.findUnique({
    where: { dni }
  });

  if (personaExistente) {
    throw new Error('Ya existe una persona con ese DNI');
  }

  // Verificar que no exista usuario con ese email
  const usuarioConEmail = await db.usuario.findFirst({
    where: {
      persona: {
        email: email
      }
    }
  });

  if (usuarioConEmail) {
    throw new Error('Ya existe un usuario con ese email');
  }

  // Hash password
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(contraseña, 10);

  // Obtener rol de la BD
  const rolDB = await db.rol.findUnique({
    where: { nombre: rol }
  });

  if (!rolDB) {
    throw new Error(`Rol ${rol} no existe en la base de datos`);
  }

  // Crear persona Y usuario en transacción
  const nuevoAdmin = await db.persona.create({
    data: {
      nombre,
      apellido,
      email,
      dni,
      usuario: {
        create: {
          passwordHash,
          estado: true,
          defaultPassword: true, // Forzar cambio de contraseña en primer login
          roles: {
            create: {
              idRol: rolDB.idRol
            }
          }
        }
      }
    },
    include: {
      usuario: {
        include: {
          roles: {
            include: { rol: true }
          }
        }
      }
    }
  });

  console.log(`[AUDIT] ${session.user.email} creó nuevo admin ${rol}: ${nombre} ${apellido} (${email})`);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/gestionar-admins');
  revalidatePath('/dashboard/crear-admin');

  return {
    success: true,
    message: `Admin creado correctamente`,
    personaNombre: `${nombre} ${apellido}`,
    usuario: nuevoAdmin.usuario
  };
}
