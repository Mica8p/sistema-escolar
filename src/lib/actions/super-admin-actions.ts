'use server';

import db from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

/**
 * Ceder control de SUPER_ADMIN a otro usuario
 * El super admin actual es desactivado inmediatamente
 */
export async function cederSuperAdmin(formData: FormData) {
  const session = await auth();

  if (!session?.user || !session.user.roles?.includes('SUPER_ADMIN')) {
    return { success: false, error: 'No tienes permisos para esta acción' };
  }

  const nombre = formData.get('nombre') as string;
  const apellido = formData.get('apellido') as string;
  const dni = formData.get('dni') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;

  if (!nombre || !apellido || !dni || !email || !password || !passwordConfirm) {
    return { success: false, error: 'Todos los campos son obligatorios' };
  }

  if (password !== passwordConfirm) {
    return { success: false, error: 'Las contraseñas no coinciden' };
  }

  if (password.length < 8) {
    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  try {
    // Obtener el super admin actual
    const superAdminActual = await db.usuario.findUnique({
      where: { idUsuario: session.user.idUsuario },
      include: { persona: true, roles: true }
    });

    if (!superAdminActual) {
      return { success: false, error: 'Usuario actual no encontrado' };
    }

    // Verificar que el nuevo super admin no exista ya
    const personaExistente = await db.persona.findUnique({
      where: { dni }
    });

    if (personaExistente) {
      return { success: false, error: `Ya existe una persona con DNI ${dni}` };
    }

    // Crear la nueva persona y usuario
    const hashedPassword = await hash(password, 10);

    const nuevoSuperAdmin = await db.persona.create({
      data: {
        nombre,
        apellido,
        dni,
        email,
        usuario: {
          create: {
            passwordHash: hashedPassword,
            estado: true,
            defaultPassword: false
          }
        }
      },
      include: { usuario: true }
    });

    // Obtener el rol SUPER_ADMIN
    const rolSuperAdmin = await db.rol.findUnique({
      where: { nombre: 'SUPER_ADMIN' }
    });

    if (!rolSuperAdmin) {
      // Rollback: eliminar el usuario creado
      await db.usuario.delete({ where: { idUsuario: nuevoSuperAdmin.usuario!.idUsuario } });
      await db.persona.delete({ where: { idPersona: nuevoSuperAdmin.idPersona } });
      return { success: false, error: 'Rol SUPER_ADMIN no encontrado en BD' };
    }

    // Asignar rol SUPER_ADMIN al nuevo usuario
    await db.usuarioRol.create({
      data: {
        idUsuario: nuevoSuperAdmin.usuario!.idUsuario,
        idRol: rolSuperAdmin.idRol
      }
    });

    // Desactivar el super admin anterior
    await db.usuario.update({
      where: { idUsuario: superAdminActual.idUsuario },
      data: { estado: false }
    });

    // Eliminar todos los roles del anterior super admin
    await db.usuarioRol.deleteMany({
      where: { idUsuario: superAdminActual.idUsuario }
    });

    console.log(`[SUPER_ADMIN] ${superAdminActual.persona.nombre} cedió control a ${nombre} ${apellido}`);

    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'Control de Super Admin cedido exitosamente. El usuario anterior ha sido desactivado.',
      newSuperAdminDni: dni
    };

  } catch (error) {
    console.error('[SUPER_ADMIN] Error al ceder control:', error);
    return {
      success: false,
      error: 'Error al ceder el control de Super Admin'
    };
  }
}

/**
 * Desactivar un super admin (solo si no cedió su puesto)
 * Solo ejecutable si hay otro super admin activo
 */
export async function desactivarSuperAdmin(idUsuarioTarget: number) {
  const session = await auth();

  if (!session?.user || !session.user.roles?.includes('SUPER_ADMIN')) {
    return { success: false, error: 'No tienes permisos para esta acción' };
  }

  if (idUsuarioTarget === session.user.idUsuario) {
    return { success: false, error: 'No puedes desactivarte a ti mismo' };
  }

  try {
    // Verificar que el usuario target sea SUPER_ADMIN
    const usuarioTarget = await db.usuario.findUnique({
      where: { idUsuario: idUsuarioTarget },
      include: { roles: true, persona: true }
    });

    if (!usuarioTarget) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    const isSuperAdmin = usuarioTarget.roles.some(r => r.idRol === 
      (await db.rol.findUnique({ where: { nombre: 'SUPER_ADMIN' } }))?.idRol);

    if (!isSuperAdmin) {
      return { success: false, error: 'El usuario no es Super Admin' };
    }

    // Contar cuántos super admins activos hay
    const superAdminsActivos = await db.usuario.count({
      where: {
        estado: true,
        roles: {
          some: {
            rol: { nombre: 'SUPER_ADMIN' }
          }
        }
      }
    });

    if (superAdminsActivos <= 1) {
      return { success: false, error: 'No puedes desactivar al único Super Admin activo' };
    }

    // Desactivar el usuario
    await db.usuario.update({
      where: { idUsuario: idUsuarioTarget },
      data: { estado: false }
    });

    console.log(`[SUPER_ADMIN] ${session.user.name} desactivó al Super Admin ${usuarioTarget.persona.nombre}`);

    revalidatePath('/dashboard');
    return {
      success: true,
      message: `Super Admin ${usuarioTarget.persona.nombre} ha sido desactivado exitosamente`
    };

  } catch (error) {
    console.error('[SUPER_ADMIN] Error al desactivar:', error);
    return {
      success: false,
      error: 'Error al desactivar el Super Admin'
    };
  }
}

/**
 * Obtener lista de super admins activos
 */
export async function obtenerSuperAdmins() {
  const session = await auth();

  if (!session?.user || !session.user.roles?.includes('SUPER_ADMIN')) {
    return { success: false, error: 'No tienes permisos para esta acción', superAdmins: [] };
  }

  try {
    const superAdmins = await db.usuario.findMany({
      where: {
        estado: true,
        roles: {
          some: {
            rol: { nombre: 'SUPER_ADMIN' }
          }
        }
      },
      include: {
        persona: {
          select: {
            idPersona: true,
            nombre: true,
            apellido: true,
            dni: true,
            email: true
          }
        }
      }
    });

    return {
      success: true,
      superAdmins: superAdmins.map(u => ({
        idUsuario: u.idUsuario,
        nombre: `${u.persona.nombre} ${u.persona.apellido}`,
        dni: u.persona.dni,
        email: u.persona.email,
        esActual: u.idUsuario === session.user.idUsuario
      }))
    };

  } catch (error) {
    console.error('[SUPER_ADMIN] Error al obtener super admins:', error);
    return {
      success: false,
      error: 'Error al obtener lista de Super Admins',
      superAdmins: []
    };
  }
}
