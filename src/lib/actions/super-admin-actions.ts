'use server';

import db from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

/**
 * Ceder control de SUPER_ADMIN a otro usuario
 * El super admin actual es desactivado inmediatamente
 * La contraseña por defecto del nuevo super admin será su DNI
 */
export async function cederSuperAdmin(prevState: any, formData: FormData | { nombre: string; apellido: string; dni: string; email: string; passwordActual: string }) {
  const session = await auth();

  if (!session?.user || !session.user.roles?.includes('SUPER_ADMIN')) {
    return { success: false, error: 'No tienes permisos para esta acción' };
  }

  // Soportar tanto FormData como objeto plano
  const extractValue = (key: string): string => {
    if (formData instanceof FormData) {
      return formData.get(key) as string;
    }
    return formData[key as keyof typeof formData] as string;
  };

  const nombre = extractValue('nombre');
  const apellido = extractValue('apellido');
  const dni = extractValue('dni');
  const email = extractValue('email');
  const passwordActual = extractValue('passwordActual');

  if (!nombre || !apellido || !dni || !email || !passwordActual) {
    return { success: false, error: 'Todos los campos son obligatorios' };
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

    // ✅ VALIDAR la contraseña actual del super admin
    const isPasswordValid = await bcrypt.compare(
      passwordActual,
      superAdminActual.passwordHash || ''
    );

    if (!isPasswordValid) {
      return { success: false, error: 'Contraseña del super admin actual incorrecta' };
    }

    // Verificar que el nuevo super admin no exista ya
    const personaExistente = await db.persona.findUnique({
      where: { dni }
    });

    if (personaExistente) {
      return { success: false, error: `Ya existe una persona con DNI ${dni}` };
    }

    // ✅ Crear la nueva persona y usuario
    // La contraseña inicial será el DNI del nuevo super admin
    const hashedDni = await bcrypt.hash(dni, 10);

    const nuevoSuperAdmin = await db.persona.create({
      data: {
        nombre,
        apellido,
        dni,
        email,
        usuario: {
          create: {
            passwordHash: hashedDni,
            estado: true,
            defaultPassword: true // ✅ Esto hará que aparezca el modal de cambio de contraseña
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

    // Obtener el rol SUPER_ADMIN
    const rolSuperAdmin = await db.rol.findUnique({
      where: { nombre: 'SUPER_ADMIN' }
    });

    const isSuperAdmin = usuarioTarget.roles.some(r => r.idRol === rolSuperAdmin?.idRol);

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
